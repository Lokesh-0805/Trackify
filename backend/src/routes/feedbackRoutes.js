const express = require('express');
const {
  createAssignments,
  getPendingAssignments,
  getAssignmentById,
} = require('../controllers/feedbackAssignmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/assignments', protect, createAssignments);
router.get('/assignments/pending', protect, getPendingAssignments);
router.get('/assignments/:id', protect, getAssignmentById);

module.exports = router;
