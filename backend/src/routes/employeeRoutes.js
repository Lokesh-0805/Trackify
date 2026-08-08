const express = require('express');
const {
  getMyProfile,
  getMyTeam,
  getEmployeeById,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.get('/my-team', protect, getMyTeam);
router.get('/:id', protect, getEmployeeById);

module.exports = router;
