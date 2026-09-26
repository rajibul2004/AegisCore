const express = require('express');
const { getMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllAsRead); // Must be before /:id to prevent parameter conflict
router.patch('/:id/read', markAsRead);

module.exports = router;
