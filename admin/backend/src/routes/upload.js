/**
 * Upload Routes
 * Handles file upload endpoints
 */

const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Configure multer to use memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

/**
 * @route   POST /api/upload/profile-picture
 * @desc    Upload profile picture
 * @access  Private
 */
router.post('/profile-picture',
  authenticate,
  upload.single('image'),
  uploadController.uploadProfilePicture
);

/**
 * @route   POST /api/upload/event-image/:eventId
 * @desc    Upload event image
 * @access  Private (Admin only)
 */
router.post('/event-image/:eventId',
  authenticate,
  upload.single('image'),
  uploadController.uploadEventImage
);

/**
 * @route   DELETE /api/upload/image/:publicId
 * @desc    Delete uploaded image
 * @access  Private
 */
router.delete('/image/:publicId',
  authenticate,
  uploadController.deleteImage
);

// Error handling middleware for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next();
});

module.exports = router;
