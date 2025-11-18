/**
 * Tests for Upload Controller
 */

const uploadController = require('../../src/controllers/uploadController');
const cloudinaryService = require('../../src/services/cloudinaryService');
const userRepository = require('../../src/database/repositories/userRepository');

jest.mock('../../src/services/cloudinaryService');
jest.mock('../../src/database/repositories/userRepository');

describe('UploadController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user-123', role: 'VOLUNTEER' },
      file: {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      },
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture successfully', async () => {
      const mockUploadResult = {
        url: 'https://cloudinary.com/profile.jpg',
        width: 400,
        height: 400
      };

      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadProfilePicture.mockResolvedValue(mockUploadResult);
      userRepository.updateProfile.mockResolvedValue({});

      await uploadController.uploadProfilePicture(req, res);

      expect(cloudinaryService.uploadProfilePicture).toHaveBeenCalledWith(
        req.file.buffer,
        req.user.id
      );
      expect(userRepository.updateProfile).toHaveBeenCalledWith(req.user.id, {
        avatar: mockUploadResult.url
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          url: mockUploadResult.url,
          width: mockUploadResult.width,
          height: mockUploadResult.height
        }
      });
    });

    it('should return 400 when no file is uploaded', async () => {
      req.file = null;

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded'
      });
    });

    it('should return 400 for invalid file type', async () => {
      req.file.mimetype = 'application/pdf';

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      });
    });

    it('should accept PNG files', async () => {
      req.file.mimetype = 'image/png';

      const mockUploadResult = {
        url: 'https://cloudinary.com/profile.png',
        width: 400,
        height: 400
      };

      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadProfilePicture.mockResolvedValue(mockUploadResult);
      userRepository.updateProfile.mockResolvedValue({});

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should accept WebP files', async () => {
      req.file.mimetype = 'image/webp';

      const mockUploadResult = {
        url: 'https://cloudinary.com/profile.webp',
        width: 400,
        height: 400
      };

      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadProfilePicture.mockResolvedValue(mockUploadResult);
      userRepository.updateProfile.mockResolvedValue({});

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when file is too large', async () => {
      req.file.size = 6 * 1024 * 1024; // 6MB

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    });

    it('should return 503 when cloudinary is not configured', async () => {
      cloudinaryService.isConfigured.mockReturnValue(false);

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Image upload service is not configured'
      });
    });

    it('should return 500 on upload error', async () => {
      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadProfilePicture.mockRejectedValue(new Error('Upload failed'));

      await uploadController.uploadProfilePicture(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to upload profile picture',
        error: 'Upload failed'
      });
    });
  });

  describe('uploadEventImage', () => {
    beforeEach(() => {
      req.user.role = 'ADMIN';
      req.params.eventId = 'event-456';
      req.file.size = 5 * 1024 * 1024; // 5MB
    });

    it('should upload event image successfully', async () => {
      const mockUploadResult = {
        url: 'https://cloudinary.com/event.jpg',
        width: 1200,
        height: 630
      };

      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadEventImage.mockResolvedValue(mockUploadResult);

      await uploadController.uploadEventImage(req, res);

      expect(cloudinaryService.uploadEventImage).toHaveBeenCalledWith(
        req.file.buffer,
        req.params.eventId
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Event image uploaded successfully',
        data: {
          url: mockUploadResult.url,
          width: mockUploadResult.width,
          height: mockUploadResult.height
        }
      });
    });

    it('should return 403 when user is not admin', async () => {
      req.user.role = 'VOLUNTEER';

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Only administrators can upload event images'
      });
    });

    it('should return 400 when no file is uploaded', async () => {
      req.file = null;

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'No file uploaded'
      });
    });

    it('should return 400 for invalid file type', async () => {
      req.file.mimetype = 'video/mp4';

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      });
    });

    it('should return 400 when file exceeds 10MB', async () => {
      req.file.size = 11 * 1024 * 1024; // 11MB

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    });

    it('should return 503 when cloudinary is not configured', async () => {
      cloudinaryService.isConfigured.mockReturnValue(false);

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Image upload service is not configured'
      });
    });

    it('should return 500 on upload error', async () => {
      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.uploadEventImage.mockRejectedValue(new Error('Upload failed'));

      await uploadController.uploadEventImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to upload event image',
        error: 'Upload failed'
      });
    });
  });

  describe('deleteImage', () => {
    beforeEach(() => {
      req.params.publicId = 'test_image_123';
    });

    it('should delete image successfully', async () => {
      const mockResult = { result: 'ok' };

      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.deleteImage.mockResolvedValue(mockResult);

      await uploadController.deleteImage(req, res);

      expect(cloudinaryService.deleteImage).toHaveBeenCalledWith(req.params.publicId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Image deleted successfully',
        data: mockResult
      });
    });

    it('should return 503 when cloudinary is not configured', async () => {
      cloudinaryService.isConfigured.mockReturnValue(false);

      await uploadController.deleteImage(req, res);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Image upload service is not configured'
      });
    });

    it('should return 500 on deletion error', async () => {
      cloudinaryService.isConfigured.mockReturnValue(true);
      cloudinaryService.deleteImage.mockRejectedValue(new Error('Delete failed'));

      await uploadController.deleteImage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to delete image',
        error: 'Delete failed'
      });
    });
  });
});
