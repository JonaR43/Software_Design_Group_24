/**
 * Cloudinary Service
 * Handles image uploads to Cloudinary CDN
 */

const cloudinary = require('cloudinary').v2;

class CloudinaryService {
  constructor() {
    this.configured = false;
    this.initializeCloudinary();
  }

  /**
   * Initialize Cloudinary configuration
   */
  initializeCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('⚠️  Cloudinary not configured - image uploads will be disabled');
      console.warn('   Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
      this.configured = false;
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    });

    this.configured = true;
    console.log('✅ Cloudinary configured successfully');
  }

  /**
   * Check if Cloudinary is configured
   */
  isConfigured() {
    return this.configured;
  }

  /**
   * Upload image from buffer
   * @param {Buffer} fileBuffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadImage(fileBuffer, options = {}) {
    if (!this.configured) {
      throw new Error('Cloudinary is not configured. Please set environment variables.');
    }

    const {
      folder = 'shiftpilot',
      transformation = {},
      publicId = null,
      resourceType = 'image'
    } = options;

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation,
          public_id: publicId,
          resource_type: resourceType,
          overwrite: true,
          invalidate: true
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes
            });
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Upload profile picture
   * @param {Buffer} fileBuffer - Image file buffer
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadProfilePicture(fileBuffer, userId) {
    return this.uploadImage(fileBuffer, {
      folder: 'shiftpilot/profiles',
      publicId: `profile_${userId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Upload event image
   * @param {Buffer} fileBuffer - Image file buffer
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadEventImage(fileBuffer, eventId) {
    return this.uploadImage(fileBuffer, {
      folder: 'shiftpilot/events',
      publicId: `event_${eventId}_${Date.now()}`,
      transformation: [
        { width: 1200, height: 630, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteImage(publicId) {
    if (!this.configured) {
      throw new Error('Cloudinary is not configured');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Get optimized image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} options - Transformation options
   * @returns {string} Optimized image URL
   */
  getOptimizedUrl(publicId, options = {}) {
    const {
      width = null,
      height = null,
      crop = 'fill',
      quality = 'auto',
      format = 'auto'
    } = options;

    const transformation = [];

    if (width || height) {
      transformation.push({
        width,
        height,
        crop
      });
    }

    transformation.push({
      quality,
      fetch_format: format
    });

    return cloudinary.url(publicId, {
      transformation,
      secure: true
    });
  }
}

module.exports = new CloudinaryService();
