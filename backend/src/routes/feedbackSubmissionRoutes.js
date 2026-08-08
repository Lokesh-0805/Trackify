const express = require('express');
const { submitFeedback, getFeedbackParameters, getMySubmissions, getMyHistory } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/parameters', protect, getFeedbackParameters);
router.post('/', protect, submitFeedback);
router.get('/my-submissions', protect, getMySubmissions);
router.get('/my-history', protect, getMyHistory);

module.exports = router;
