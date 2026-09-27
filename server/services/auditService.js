const AuditLog = require('../models/AuditLog');

/**
 * Audit Service
 * Provides a reusable interface for tracking critical system actions securely.
 */
class AuditService {
  /**
   * Log a system action
   * @param {Object} req - The Express request object (used to extract user ID and IP)
   * @param {String} action - The action performed (e.g., 'case_created')
   * @param {String} entityType - The type of record affected (e.g., 'Case')
   * @param {String} entityId - The ID of the record affected
   * @param {Object} details - Any additional metadata
   */
  async log(req, action, entityType = 'System', entityId = null, details = {}) {
    try {
      if (!req.user || !req.user._id) return; // Silent return if no user contextualized

      const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

      await AuditLog.create({
        user: req.user._id,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // We don't throw to avoid crashing primary business flows
    }
  }

  /**
   * Log an AI specifically via internal ID when req isn't fully available or applicable
   */
  async logInternal(userId, action, entityType = 'System', entityId = null, details = {}) {
    try {
      await AuditLog.create({
        user: userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress: 'Internal Process',
      });
    } catch (error) {
      console.error('Failed to write internal audit log:', error);
    }
  }
}

module.exports = new AuditService();
