const pool = require('../config/db');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ─── Razorpay Setup ────────────────────────────────────
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Email Setup ───────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Publication fee in rupees
const PUBLICATION_FEE = 1000;

// ─── ROUTE 1: Create Payment Order ────────────────────
// POST /api/payments/create-order
// Body: { articleId }
// Creates a Razorpay order → frontend uses this to open payment modal
const createOrder = async (req, res) => {
    const { articleId } = req.body;
    const userId = req.user.id;

    if (!articleId) {
        return res.status(400).json({ error: 'Article ID is required.' });
    }

    try {
        // Check article exists and belongs to this user
        const articleResult = await pool.query(
            'SELECT * FROM articles WHERE id = $1 AND user_id = $2 AND status = $3',
            [articleId, userId, 'PAYMENT_PENDING']
        );

        if (articleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found or payment not required.' });
        }

        // Create order in Razorpay
        // Amount must be in paise (₹1 = 100 paise)
        const order = await razorpay.orders.create({
            amount: PUBLICATION_FEE * 100,
            currency: 'INR',
            receipt: `rpp_${articleId.slice(0, 8)}`,
        });

        // Save order to our database
        await pool.query(
            `INSERT INTO payments (article_id, razorpay_order_id, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (article_id) 
       DO UPDATE SET razorpay_order_id = $2, status = 'PENDING'`,
            [articleId, order.id, PUBLICATION_FEE]
        );

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });

    } catch (err) {
        console.error('Create order error:', err.message);
        res.status(500).json({ error: 'Failed to create payment order.' });
    }
};

// ─── ROUTE 2: Verify Payment ──────────────────────────
// POST /api/payments/verify
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, articleId }
// Called after user completes payment in Razorpay modal
const verifyPayment = async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, articleId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !articleId) {
        return res.status(400).json({ error: 'Missing payment details.' });
    }

    try {
        // Verify signature to confirm payment is genuine
        // Razorpay signs the response — we recreate and compare
        const body = `${razorpayOrderId}|${razorpayPaymentId}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
        }

        // Update payment record to SUCCESS
        await pool.query(
            `UPDATE payments 
       SET razorpay_payment_id = $1, status = 'SUCCESS', paid_at = NOW()
       WHERE article_id = $2`,
            [razorpayPaymentId, articleId]
        );

        // Update article status to APPROVED (ready for admin to publish)
        await pool.query(
            `UPDATE articles SET status = 'APPROVED', updated_at = NOW() WHERE id = $1`,
            [articleId]
        );

        // Get article and user details for email
        const result = await pool.query(
            `SELECT a.title, u.name, u.email 
       FROM articles a JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
            [articleId]
        );

        const { title, name, email } = result.rows[0];

        // Send payment confirmation email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Payment Successful — Article Queued for Publishing',
            html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #1B3A6B;">Payment Confirmed ✅</h2>
          <p>Hi ${name},</p>
          <p>Payment of <strong>₹${PUBLICATION_FEE}</strong> received for:</p>
          <p><strong>"${title}"</strong></p>
          <p>Our team will publish your article shortly.</p>
        </div>
      `,
        });

        // Save notification
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ((SELECT user_id FROM articles WHERE id = $1), $2)',
            [articleId, `Payment successful for "${title}". Your article will be published soon.`]
        );

        res.json({ message: 'Payment verified successfully.' });

    } catch (err) {
        console.error('Verify payment error:', err.message);
        res.status(500).json({ error: 'Payment verification failed.' });
    }
};

// ─── ROUTE 3: Get Payment Status ──────────────────────
// GET /api/payments/status/:articleId
const getPaymentStatus = async (req, res) => {
    const { articleId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM payments WHERE article_id = $1',
            [articleId]
        );

        if (result.rows.length === 0) {
            return res.json({ status: 'NOT_CREATED' });
        }

        res.json({ payment: result.rows[0] });

    } catch (err) {
        console.error('Payment status error:', err.message);
        res.status(500).json({ error: 'Failed to get payment status.' });
    }
};

module.exports = { createOrder, verifyPayment, getPaymentStatus };