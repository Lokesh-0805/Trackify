const express = require('express');
const { getPendingFeedback, getFeedbackStatusSummary } = require('../controllers/hrController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/pending-feedback', protect, authorizeRoles('HR'), getPendingFeedback);
router.get('/feedback-status', protect, authorizeRoles('HR'), getFeedbackStatusSummary);

module.exports = router;
