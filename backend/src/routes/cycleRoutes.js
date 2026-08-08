const express = require('express');
const { createCycle, getCurrentCycle } = require('../controllers/feedbackCycleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createCycle);
router.get('/current', protect, getCurrentCycle);

module.exports = router;
