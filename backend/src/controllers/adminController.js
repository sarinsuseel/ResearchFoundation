const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// ─── Email Setup ───────────────────────────────────────
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};

// ─── ROUTE 1: Get All Submissions ─────────────────────
// GET /api/admin/submissions
// Admin sees every article submitted with filters
const getAllSubmissions = async (req, res) => {
    const { status } = req.query;

    try {
        let query;
        let params;

        if (status) {
            query = `
        SELECT a.*, u.name as author_name, u.email as author_email,
               p.status as payment_status, p.amount as payment_amount
        FROM articles a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN payments p ON p.article_id = a.id
        WHERE a.status = $1
        ORDER BY a.created_at DESC
      `;
            params = [status];
        } else {
            query = `
        SELECT a.*, u.name as author_name, u.email as author_email,
               p.status as payment_status, p.amount as payment_amount
        FROM articles a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN payments p ON p.article_id = a.id
        ORDER BY a.created_at DESC
      `;
            params = [];
        }

        const result = await pool.query(query, params);
        res.json({ submissions: result.rows });

    } catch (err) {
        console.error('Get submissions error:', err.message);
        res.status(500).json({ error: 'Failed to fetch submissions.' });
    }
};

// ─── ROUTE 2: Approve Article ─────────────────────────
// PUT /api/admin/submissions/:id/approve
// Admin approves → status becomes PAYMENT_PENDING → email sent to author
const approveArticle = async (req, res) => {
    const { id } = req.params;

    try {
        // Get the article and author details
        const result = await pool.query(
            `SELECT a.*, u.name as author_name, u.email as author_email
       FROM articles a JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        const article = result.rows[0];

        // Update status to PAYMENT_PENDING
        await pool.query(
            'UPDATE articles SET status = $1, updated_at = NOW() WHERE id = $2',
            ['PAYMENT_PENDING', id]
        );

        // Send approval email to author
        await sendEmail(
            article.author_email,
            'Your Article Has Been Approved — Payment Required',
            `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #1B3A6B;">Article Approved! 🎉</h2>
          <p>Hi ${article.author_name},</p>
          <p>Your article <strong>"${article.title}"</strong> has been approved.</p>
          <p>Please login to your dashboard and complete the payment to publish your article.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background:#1B3A6B;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
            Go to Dashboard
          </a>
        </div>
      `
        );

        // Save notification
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [article.user_id, `Your article "${article.title}" has been approved! Please complete payment.`]
        );

        res.json({ message: 'Article approved. Payment request sent to author.' });

    } catch (err) {
        console.error('Approve error:', err.message);
        res.status(500).json({ error: 'Approval failed.' });
    }
};

// ─── ROUTE 3: Reject Article ──────────────────────────
// PUT /api/admin/submissions/:id/reject
// Body: { reason }
const rejectArticle = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const result = await pool.query(
            `SELECT a.*, u.name as author_name, u.email as author_email
       FROM articles a JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        const article = result.rows[0];

        // Update status
        await pool.query(
            'UPDATE articles SET status = $1, reject_note = $2, updated_at = NOW() WHERE id = $3',
            ['REJECTED', reason || null, id]
        );

        // Send rejection email
        await sendEmail(
            article.author_email,
            'Update on Your Article Submission',
            `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #1B3A6B;">Submission Update</h2>
          <p>Hi ${article.author_name},</p>
          <p>Unfortunately your article <strong>"${article.title}"</strong> was not approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>You are welcome to revise and resubmit.</p>
        </div>
      `
        );

        // Save notification
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [article.user_id, `Your article "${article.title}" was not approved.${reason ? ' Reason: ' + reason : ''}`]
        );

        res.json({ message: 'Article rejected.' });

    } catch (err) {
        console.error('Reject error:', err.message);
        res.status(500).json({ error: 'Rejection failed.' });
    }
};

// ─── ROUTE 4: Publish Article ─────────────────────────
// PUT /api/admin/articles/:id/publish
// Admin publishes after payment is confirmed
const publishArticle = async (req, res) => {
    const { id } = req.params;

    try {
        // Check payment is completed first
        const paymentResult = await pool.query(
            'SELECT * FROM payments WHERE article_id = $1 AND status = $2',
            [id, 'SUCCESS']
        );

        if (paymentResult.rows.length === 0) {
            return res.status(400).json({ error: 'Payment not completed. Cannot publish yet.' });
        }

        // Get article and author
        const result = await pool.query(
            `SELECT a.*, u.name as author_name, u.email as author_email
       FROM articles a JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
            [id]
        );

        const article = result.rows[0];

        // Update article to published
        await pool.query(
            `UPDATE articles 
       SET status = 'PUBLISHED', is_published = true, published_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
            [id]
        );

        // Send published email
        await sendEmail(
            article.author_email,
            'Your Article is Now Live! 🚀',
            `
        <div style="font-family: Arial; padding: 20px;">
          <h2 style="color: #1B3A6B;">Article Published!</h2>
          <p>Hi ${article.author_name},</p>
          <p>Your article <strong>"${article.title}"</strong> is now live on our platform!</p>
          <a href="${process.env.FRONTEND_URL}/articles/${article.id}"
             style="background:#1B3A6B;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
            View Your Article
          </a>
        </div>
      `
        );

        // Save notification
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [article.user_id, `Your article "${article.title}" is now live!`]
        );

        res.json({ message: 'Article published successfully.' });

    } catch (err) {
        console.error('Publish error:', err.message);
        res.status(500).json({ error: 'Publishing failed.' });
    }
};

// ─── ROUTE 5: Hide Article ────────────────────────────
// PATCH /api/admin/articles/:id/hide
const hideArticle = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query(
            `UPDATE articles SET status = 'HIDDEN', is_published = false, updated_at = NOW() WHERE id = $1`,
            [id]
        );
        res.json({ message: 'Article hidden.' });
    } catch (err) {
        console.error('Hide error:', err.message);
        res.status(500).json({ error: 'Failed to hide article.' });
    }
};

// ─── ROUTE 6: Delete Article ──────────────────────────
// DELETE /api/admin/articles/:id
const deleteArticle = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.json({ message: 'Article deleted permanently.' });
    } catch (err) {
        console.error('Delete error:', err.message);
        res.status(500).json({ error: 'Failed to delete article.' });
    }
};

module.exports = {
    getAllSubmissions,
    approveArticle,
    rejectArticle,
    publishArticle,
    hideArticle,
    deleteArticle,
};