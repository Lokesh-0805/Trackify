const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/hr-check', protect, authorizeRoles('HR'), (req, res) => {
  res.json({ success: true, message: 'HR access granted' });
});

module.exports = router;
