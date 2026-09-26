const fs = require('fs');
const path = require('path');

/**
 * Storage Service Abstraction
 * 
 * This service abstracts away the file storage implementation.
 * Currently, it uses the local file system. 
 * In the future, to migrate to AWS S3, we only need to rewrite the 
 * methods in this file (e.g., using AWS SDK to push streams to an S3 bucket).
 * The controllers and database models will not need any changes.
 */

class StorageService {
  /**
   * Processes an uploaded file object (e.g. from multer) and returns a storage URL
   * @param {Object} file - The file object from req.file
   * @returns {Promise<String>} - The URL or path to access the file
   */
  async uploadFile(file) {
    // In local dev, multer diskStorage already saved it to /uploads/
    // We just need to return the public path to access it
    // If we switch to S3 later, multer would use memoryStorage, 
    // and we would take file.buffer here and upload to S3, returning the S3 URL.
    
    return `/uploads/${file.filename}`;
  }

  /**
   * Deletes a file from storage
   * @param {String} fileUrl - The URL/path stored in the database
   * @returns {Promise<Boolean>}
   */
  async deleteFile(fileUrl) {
    try {
      // For local storage, we extract the filename from the URL
      const filename = path.basename(fileUrl);
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

module.exports = new StorageService();
