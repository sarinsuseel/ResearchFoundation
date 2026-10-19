const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Import all routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

const app = express();

// ─── Security Middleware ──────────────────────────────
// helmet adds secure HTTP headers automatically
app.use(helmet());

// cors allows the frontend (localhost:3000) to talk to this backend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// ─── Body Parsing ─────────────────────────────────────
// Allows reading JSON from request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Static Files ─────────────────────────────────────
// Makes uploaded files accessible via URL
// Example: http://localhost:5000/uploads/myfile.pdf
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// ─── Health Check ─────────────────────────────────────
// Visit http://localhost:5000/health to confirm server is running
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});