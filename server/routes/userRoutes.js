const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, createRoleRequest, getRoleRequests, processRoleRequest } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.get('/', protect, requireRole('admin', 'police'), getUsers);
router.patch('/:id/role', protect, requireRole('admin'), updateUserRole);
router.delete('/:id', protect, requireRole('admin'), deleteUser);

// Role Requests
router.post('/request-role', protect, createRoleRequest);
router.get('/role-requests', protect, requireRole('admin'), getRoleRequests);
router.put('/role-requests/:id/process', protect, requireRole('admin'), processRoleRequest);

module.exports = router;
