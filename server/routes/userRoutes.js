const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', protect, requireRole('admin', 'police'), getUsers);
router.patch('/:id/role', protect, requireRole('admin'), updateUserRole);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;
