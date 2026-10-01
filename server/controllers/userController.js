const User = require('../models/User');
const RoleRequest = require('../models/RoleRequest');
const notificationService = require('../services/notificationService');
const { sendRoleUpdateEmail } = require('../services/otpDeliveryService');

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// ... existing code ...
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['public', 'police', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot demote the last admin' });
      }
    }

    user.role = role;
    await user.save();
    
    res.json({ success: true, data: { _id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the last admin' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

// NEW: Create Role Request
const createRoleRequest = async (req, res) => {
  try {
    const { requestedRole, reason } = req.body;

    if (!['admin', 'police'].includes(requestedRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role requested' });
    }

    // Check if user already has this role
    if (req.user.role === requestedRole) {
      return res.status(400).json({ success: false, message: `You already have the ${requestedRole} role.` });
    }

    // Check if there is an existing pending request
    const existingReq = await RoleRequest.findOne({ user: req.user._id, status: 'pending' });
    if (existingReq) {
      return res.status(400).json({ success: false, message: 'You already have a pending role request.' });
    }

    const newRequest = await RoleRequest.create({
      user: req.user._id,
      requestedRole,
      reason
    });

    // Notify all admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await notificationService.createNotification({
        recipient: admin._id,
        sender: req.user._id,
        type: 'role_request',
        title: 'New Access Request',
        message: `${req.user.name} has requested ${requestedRole} access.`,
        link: '/users'
      });
    }

    res.status(201).json({ success: true, data: newRequest, message: 'Access request submitted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error creating role request' });
  }
};

// NEW: Get Role Requests (Admin only)
const getRoleRequests = async (req, res) => {
  try {
    const requests = await RoleRequest.find().populate('user', 'name email role').sort('-createdAt');
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching role requests' });
  }
};

// NEW: Process Role Request (Approve/Reject)
const processRoleRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    const request = await RoleRequest.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}` });
    }

    request.status = status;
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    if (status === 'approved') {
      request.user.role = request.requestedRole;
      await request.user.save();
      
      // Notify User
      await notificationService.createNotification({
        recipient: request.user._id,
        sender: req.user._id,
        type: 'role_approved',
        title: 'Access Request Approved',
        message: `Your request for ${request.requestedRole} access has been approved! You can now access new features.`,
        link: '/'
      });
      // Send Email
      await sendRoleUpdateEmail(request.user, request.requestedRole, 'approved');
    } else {
      await notificationService.createNotification({
        recipient: request.user._id,
        sender: req.user._id,
        type: 'role_rejected',
        title: 'Access Request Denied',
        message: `Your request for ${request.requestedRole} access was not approved at this time.`,
        link: '/'
      });
      // Send Email
      await sendRoleUpdateEmail(request.user, request.requestedRole, 'rejected');
    }

    res.json({ success: true, data: request, message: `Request ${status} successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error processing request' });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser, createRoleRequest, getRoleRequests, processRoleRequest };
