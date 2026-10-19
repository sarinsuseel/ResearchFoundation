const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

// ─── Helper: Generate 6 digit OTP ─────────────────────
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ─── Helper: Send OTP Email ────────────────────────────
const sendOTPEmail = async (email, otp, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - ASRF Research Platform',
    html: `
      <div style="font-family: Arial; max-width: 500px; margin: 0 auto; padding: 20px;">
        <div style="background: #1B3A6B; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">ASRF Research Platform</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1e293b;">Hi ${name},</h2>
          <p style="color: #64748b;">Please use the OTP below to verify your email address:</p>
          <div style="background: #f0f4ff; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <span style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #1B3A6B;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      </div>
    `,
  });
};

// ─── ROUTE 1: Send OTP (for registration) ─────────────
// POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email.' });
  }

  try {
    // Check if email already registered
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered. Please login instead.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate old OTPs
    await pool.query(
      'UPDATE otps SET is_used = true WHERE email = $1 AND is_used = false',
      [email.toLowerCase().trim()]
    );

    // Save new OTP
    await pool.query(
      'INSERT INTO otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase().trim(), otp, expiresAt]
    );

    await sendOTPEmail(email, otp, name || 'Researcher');

    res.json({ message: `OTP sent to ${email}` });

  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Try again.' });
  }
};

// ─── ROUTE 2: Register ────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, otp }
const register = async (req, res) => {
  const { name, email, password, otp } = req.body;

  if (!name || !email || !password || !otp) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const otpResult = await pool.query(
      `SELECT * FROM otps 
       WHERE email = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [normalizedEmail, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE otps SET is_used = true WHERE id = $1',
      [otpResult.rows[0].id]
    );

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, is_verified)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed. Try again.' });
  }
};

// ─── ROUTE 3: Login ───────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'No account found with this email.' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Try again.' });
  }
};

module.exports = { sendOtp, register, login };