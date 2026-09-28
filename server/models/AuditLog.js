const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g., 'login', 'fir_created', 'case_updated'
    },
    entityType: {
      type: String,
      // e.g., 'FIR', 'Case', 'Evidence', 'Suspect', 'User', 'System', 'Report', 'AI'
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Storing flexible metadata (e.g. what fields changed)
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent modifications to audit logs after creation
auditLogSchema.pre('findOneAndUpdate', function() {
  throw new Error('Audit logs are immutable and cannot be modified');
});

auditLogSchema.pre('updateOne', function() {
  throw new Error('Audit logs are immutable and cannot be modified');
});

auditLogSchema.pre('deleteOne', function() {
  throw new Error('Audit logs are immutable and cannot be deleted');
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
