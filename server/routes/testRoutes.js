const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/anyone', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Any logged-in user can see this',
    user: req.user.name,
    role: req.user.role,
  });
});

router.get('/admin-only', protect, requireRole('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Only admins can see this',
    user: req.user.name,
    role: req.user.role,
  });
});

router.get('/police-only', protect, requireRole('police'), (req, res) => {
  res.json({
    success: true,
    message: 'Only police officers can see this',
    user: req.user.name,
    role: req.user.role,
  });
});

router.get('/staff-only', protect, requireRole('admin', 'police'), (req, res) => {
  res.json({
    success: true,
    message: 'Admins and police officers can see this',
    user: req.user.name,
    role: req.user.role,
  });
});

router.get('/public-only', protect, requireRole('public'), (req, res) => {
  res.json({
    success: true,
    message: 'Only public users can see this',
    user: req.user.name,
    role: req.user.role,
  });
});

module.exports = router;
