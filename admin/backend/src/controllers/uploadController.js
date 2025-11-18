/**
 * Upload Controller
 * Handles file upload operations
 */

const cloudinaryService = require('../services/cloudinaryService');
const userRepository = require('../database/repositories/userRepository');

/**
 * Upload profile picture
 */
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }

    // Check if Cloudinary is configured
    if (!cloudinaryService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service is not configured'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadProfilePicture(
      req.file.buffer,
      userId
    );

    // Update user profile with new avatar URL
    await userRepository.updateProfile(userId, {
      avatar: uploadResult.url
    });

    console.log(`Profile picture uploaded for user ${userId}:`, uploadResult.url);

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

/**
 * Upload event image
 */
const uploadEventImage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Only admins can upload event images
    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can upload event images'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      });
    }

    // Validate file size (max 10MB for event images)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    // Check if Cloudinary is configured
    if (!cloudinaryService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service is not configured'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinaryService.uploadEventImage(
      req.file.buffer,
      eventId
    );

    // TODO: Update event with image URL in database
    // For now, just return the URL - you can add this to Event model later

    console.log(`Event image uploaded for event ${eventId}:`, uploadResult.url);

    res.status(200).json({
      success: true,
      message: 'Event image uploaded successfully',
      data: {
        url: uploadResult.url,
        width: uploadResult.width,
        height: uploadResult.height
      }
    });
  } catch (error) {
    console.error('Event image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload event image',
      error: error.message
    });
  }
};

/**
 * Delete uploaded image
 */
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;
    const userId = req.user.id;

    // Check if Cloudinary is configured
    if (!cloudinaryService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Image upload service is not configured'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinaryService.deleteImage(publicId);

    console.log(`Image deleted by user ${userId}:`, publicId);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

module.exports = {
  uploadProfilePicture,
  uploadEventImage,
  deleteImage
};
