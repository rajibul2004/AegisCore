const Notification = require('../models/Notification');

/**
 * Notification Service Layer
 * Abstracts the creation of notifications so other modules (Cases, Evidence) 
 * don't need to tightly couple with the Notification database model.
 */
class NotificationService {
  
  /**
   * Generates a new notification and saves it to the database.
   * @param {Object} data - Notification payload
   * @param {String} data.recipient - User ID receiving the notification
   * @param {String} [data.sender] - User ID sending the notification (optional)
   * @param {String} data.type - Type of notification (enum)
   * @param {String} data.title - Notification title
   * @param {String} data.message - Detailed message
   * @param {String} [data.link] - URL link to redirect when clicked
   */
  async createNotification(data) {
    try {
      const notification = await Notification.create({
        recipient: data.recipient,
        sender: data.sender || null,
        type: data.type || 'general',
        title: data.title,
        message: data.message,
        link: data.link || '',
      });

      // Require socket here to avoid circular dependency issues at boot
      const { emitToUser } = require('../config/socket');
      emitToUser(data.recipient, 'new_notification', notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification in service:', error);
      // We don't throw here to prevent halting the main business logic (like creating a case)
      // just because a notification failed to save.
    }
  }

  /**
   * Notify multiple users (e.g. all admins or an entire department)
   */
  async notifyMultiple(recipientsArray, notificationData) {
    const promises = recipientsArray.map(userId => 
      this.createNotification({ ...notificationData, recipient: userId })
    );
    await Promise.all(promises);
  }
}

module.exports = new NotificationService();
