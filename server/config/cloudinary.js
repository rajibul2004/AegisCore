const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aegiscore/firs',
    resource_type: 'auto', // Allows images, pdfs, etc.
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4'],
  },
});

module.exports = { cloudinary, storage };
