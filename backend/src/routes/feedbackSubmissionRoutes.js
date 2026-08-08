const express = require('express');
const { submitFeedback, getMySubmissions } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/my-submissions', protect, getMySubmissions);

module.exports = router;
