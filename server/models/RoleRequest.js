const mongoose = require('mongoose');

const RoleRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedRole: {
    type: String,
    enum: ['admin', 'police'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('RoleRequest', RoleRequestSchema);
