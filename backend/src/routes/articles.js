const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const {
    submitArticle,
    getMySubmissions,
    getPublishedArticles,
    getPublishedArticle,
    downloadArticle,
} = require('../controllers/articleController');

// ─── File Upload Setup ────────────────────────────────
// Multer saves uploaded files to the "uploads" folder
// Each file gets a unique name so files never overwrite each other
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save to uploads folder
    },
    filename: (req, file, cb) => {
        // Filename = timestamp + original name
        // Example: 1714123456789-myarticle.pdf
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

// Only allow PDF, DOC, DOCX files
const fileFilter = (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
        cb(null, true); // Accept file
    } else {
        cb(new Error('Only PDF, DOC, DOCX files allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// ─── Public Routes (no login needed) ─────────────────
router.get('/published', getPublishedArticles);
router.get('/published/:id', getPublishedArticle);
router.get('/:id/download', downloadArticle);

// ─── Protected Routes (login required) ───────────────
router.post('/submit', protect, upload.single('file'), submitArticle);
router.get('/my-submissions', protect, getMySubmissions);

module.exports = router;