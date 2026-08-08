const express = require('express');
const { submitFeedback, getMySubmissions, getMyHistory } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/my-history', protect, getMyHistory);

module.exports = router;
