const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getAllSubmissions,
    approveArticle,
    rejectArticle,
    publishArticle,
    hideArticle,
    deleteArticle,
} = require('../controllers/adminController');

// All admin routes require login AND admin role
router.use(protect, adminOnly);

router.get('/submissions', getAllSubmissions);
router.put('/submissions/:id/approve', approveArticle);
router.put('/submissions/:id/reject', rejectArticle);
router.put('/articles/:id/publish', publishArticle);
router.patch('/articles/:id/hide', hideArticle);
router.delete('/articles/:id', deleteArticle);

module.exports = router;