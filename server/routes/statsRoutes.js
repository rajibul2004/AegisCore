const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All roles can hit this endpoint, but the controller handles returning
// different data aggregations depending on if the user is Public vs Police/Admin
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
