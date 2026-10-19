const pool = require('../config/db');
require('dotenv').config();

// ─── ROUTE 1: Submit Article ──────────────────────────
// POST /api/articles/submit
// User uploads article → we save file info to database
const submitArticle = async (req, res) => {
    const { title, abstract, keywords } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !abstract) {
        return res.status(400).json({ error: 'Title and abstract are required.' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload your manuscript file.' });
    }

    try {
        // Save file path and article info to database
        // req.file.path = where multer saved the file on the server
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileName = req.file.originalname;

        const result = await pool.query(
            `INSERT INTO articles (title, abstract, keywords, file_url, file_name, user_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, abstract, keywords || null, fileUrl, fileName, userId]
        );

        const article = result.rows[0];

        // Save a notification for the user
        await pool.query(
            'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
            [userId, `Your article "${title}" has been submitted and is under review.`]
        );

        res.status(201).json({
            message: 'Article submitted successfully.',
            article,
        });

    } catch (err) {
        console.error('Submit article error:', err.message);
        res.status(500).json({ error: 'Submission failed. Try again.' });
    }
};

// ─── ROUTE 2: Get My Submissions ──────────────────────
// GET /api/articles/my-submissions
// Returns all articles submitted by the logged in user
const getMySubmissions = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT a.*, p.status as payment_status, p.amount as payment_amount
       FROM articles a
       LEFT JOIN payments p ON p.article_id = a.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
            [userId]
        );

        res.json({ articles: result.rows });

    } catch (err) {
        console.error('Get submissions error:', err.message);
        res.status(500).json({ error: 'Failed to fetch submissions.' });
    }
};

// ─── ROUTE 3: Get Published Articles ─────────────────
// GET /api/articles/published
// Returns all published articles — visible to everyone
const getPublishedArticles = async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query;
        let params;

        if (search) {
            // Search in title, abstract, and keywords
            query = `
        SELECT a.id, a.title, a.abstract, a.keywords, a.published_at,
               u.name as author_name
        FROM articles a
        JOIN users u ON u.id = a.user_id
        WHERE a.is_published = true
        AND (
          a.title ILIKE $1 OR
          a.abstract ILIKE $1 OR
          a.keywords ILIKE $1
        )
        ORDER BY a.published_at DESC
        LIMIT $2 OFFSET $3
      `;
            params = [`%${search}%`, limit, offset];
        } else {
            query = `
        SELECT a.id, a.title, a.abstract, a.keywords, a.published_at,
               u.name as author_name
        FROM articles a
        JOIN users u ON u.id = a.user_id
        WHERE a.is_published = true
        ORDER BY a.published_at DESC
        LIMIT $1 OFFSET $2
      `;
            params = [limit, offset];
        }

        const result = await pool.query(query, params);

        // Get total count for pagination
        const countResult = await pool.query(
            `SELECT COUNT(*) FROM articles WHERE is_published = true`,
        );

        res.json({
            articles: result.rows,
            total: parseInt(countResult.rows[0].count),
            page: parseInt(page),
            totalPages: Math.ceil(countResult.rows[0].count / limit),
        });

    } catch (err) {
        console.error('Get published error:', err.message);
        res.status(500).json({ error: 'Failed to fetch articles.' });
    }
};

// ─── ROUTE 4: Get Single Published Article ────────────
// GET /api/articles/published/:id
// Returns full detail of one published article
const getPublishedArticle = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT a.*, u.name as author_name
       FROM articles a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1 AND a.is_published = true`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        res.json({ article: result.rows[0] });

    } catch (err) {
        console.error('Get article error:', err.message);
        res.status(500).json({ error: 'Failed to fetch article.' });
    }
};

// ─── ROUTE 5: Download Article ────────────────────────
// GET /api/articles/:id/download
// Returns the file URL for downloading
const downloadArticle = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT file_url, file_name FROM articles WHERE id = $1 AND is_published = true',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found.' });
        }

        const { file_url, file_name } = result.rows[0];

        res.json({ downloadUrl: file_url, fileName: file_name });

    } catch (err) {
        console.error('Download error:', err.message);
        res.status(500).json({ error: 'Download failed.' });
    }
};

module.exports = {
    submitArticle,
    getMySubmissions,
    getPublishedArticles,
    getPublishedArticle,
    downloadArticle,
};