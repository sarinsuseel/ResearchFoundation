const express = require('express');
const router = express.Router();
const { sendOtp, register, login } = require('../controllers/authController');

// POST /api/auth/send-otp  → send OTP to email (for registration)
router.post('/send-otp', sendOtp);

// POST /api/auth/register  → verify OTP + create account
router.post('/register', register);

// POST /api/auth/login     → email + password login
router.post('/login', login);

module.exports = router;