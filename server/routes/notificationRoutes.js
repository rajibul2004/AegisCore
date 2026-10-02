const express = require('express');
const { getMyNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMyNotifications);
router.delete('/all', deleteAllNotifications);
router.patch('/read-all', markAllAsRead); 
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
