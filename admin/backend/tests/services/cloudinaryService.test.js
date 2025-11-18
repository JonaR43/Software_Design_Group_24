/**
 * Tests for Cloudinary Service
 */

// Set environment variables BEFORE requiring the service
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-key';
process.env.CLOUDINARY_API_SECRET = 'test-secret';

// Mock the cloudinary module
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn()
    },
    url: jest.fn()
  }
}));

const cloudinary = require('cloudinary').v2;
const cloudinaryService = require('../../src/services/cloudinaryService');

describe('CloudinaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isConfigured', () => {
    it('should return true when cloudinary is configured', () => {
      const result = cloudinaryService.isConfigured();
      expect(result).toBe(true);
    });

    it('should return false when credentials are missing', () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;

      // Need to re-require to test initialization
      jest.resetModules();
      const cloudinaryService2 = require('../../src/services/cloudinaryService');

      expect(cloudinaryService2.isConfigured()).toBe(false);
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'test_id',
        width: 400,
        height: 400,
        format: 'jpg',
        bytes: 12345
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const result = await cloudinaryService.uploadImage(mockBuffer);

      expect(result).toEqual({
        url: mockResult.secure_url,
        publicId: mockResult.public_id,
        width: mockResult.width,
        height: mockResult.height,
        format: mockResult.format,
        bytes: mockResult.bytes
      });
    });

    it('should handle upload errors', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockError = new Error('Upload failed');

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(mockError, null);
        return { end: jest.fn() };
      });

      await expect(cloudinaryService.uploadImage(mockBuffer)).rejects.toThrow('Upload failed');
    });

    it('should reject when cloudinary is not configured', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      jest.resetModules();
      const cloudinaryService2 = require('../../src/services/cloudinaryService');

      const mockBuffer = Buffer.from('test-image');

      await expect(cloudinaryService2.uploadImage(mockBuffer))
        .rejects
        .toThrow('Cloudinary is not configured');
    });

    it('should accept custom options', async () => {
      const mockBuffer = Buffer.from('test-image');
      const mockResult = {
        secure_url: 'https://cloudinary.com/image.jpg',
        public_id: 'custom_id',
        width: 800,
        height: 600,
        format: 'png',
        bytes: 54321
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        expect(options.folder).toBe('custom-folder');
        expect(options.public_id).toBe('custom-id');
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const result = await cloudinaryService.uploadImage(mockBuffer, {
        folder: 'custom-folder',
        publicId: 'custom-id'
      });

      expect(result.publicId).toBe('custom_id');
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture with correct transformations', async () => {
      const mockBuffer = Buffer.from('test-image');
      const userId = 'user-123';
      const mockResult = {
        secure_url: 'https://cloudinary.com/profile.jpg',
        public_id: `profile_${userId}`,
        width: 400,
        height: 400,
        format: 'jpg',
        bytes: 12345
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        expect(options.folder).toBe('shiftpilot/profiles');
        expect(options.public_id).toBe(`profile_${userId}`);
        expect(options.transformation).toBeDefined();
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const result = await cloudinaryService.uploadProfilePicture(mockBuffer, userId);

      expect(result.url).toBe(mockResult.secure_url);
    });
  });

  describe('uploadEventImage', () => {
    it('should upload event image with correct transformations', async () => {
      const mockBuffer = Buffer.from('test-image');
      const eventId = 'event-456';
      const mockResult = {
        secure_url: 'https://cloudinary.com/event.jpg',
        public_id: `event_${eventId}_123456`,
        width: 1200,
        height: 630,
        format: 'jpg',
        bytes: 54321
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        expect(options.folder).toBe('shiftpilot/events');
        expect(options.public_id).toContain(`event_${eventId}`);
        callback(null, mockResult);
        return { end: jest.fn() };
      });

      const result = await cloudinaryService.uploadEventImage(mockBuffer, eventId);

      expect(result.url).toBe(mockResult.secure_url);
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const publicId = 'test_image_id';
      const mockResult = { result: 'ok' };

      cloudinary.uploader.destroy.mockResolvedValue(mockResult);

      const result = await cloudinaryService.deleteImage(publicId);

      expect(result).toEqual(mockResult);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('should handle deletion errors', async () => {
      const publicId = 'test_image_id';
      const mockError = new Error('Delete failed');

      cloudinary.uploader.destroy.mockRejectedValue(mockError);

      await expect(cloudinaryService.deleteImage(publicId)).rejects.toThrow('Delete failed');
    });

    it('should reject when cloudinary is not configured', async () => {
      delete process.env.CLOUDINARY_CLOUD_NAME;
      jest.resetModules();
      const cloudinaryService2 = require('../../src/services/cloudinaryService');

      await expect(cloudinaryService2.deleteImage('test_id'))
        .rejects
        .toThrow('Cloudinary is not configured');
    });
  });

  describe('getOptimizedUrl', () => {
    it('should generate optimized URL with transformations', () => {
      const publicId = 'test_image';
      const mockUrl = 'https://cloudinary.com/optimized.jpg';

      cloudinary.url.mockReturnValue(mockUrl);

      const result = cloudinaryService.getOptimizedUrl(publicId, {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto',
        format: 'auto'
      });

      expect(result).toBe(mockUrl);
      expect(cloudinary.url).toHaveBeenCalledWith(
        publicId,
        expect.objectContaining({
          secure: true,
          transformation: expect.any(Array)
        })
      );
    });

    it('should generate URL without dimensions', () => {
      const publicId = 'test_image';
      const mockUrl = 'https://cloudinary.com/optimized.jpg';

      cloudinary.url.mockReturnValue(mockUrl);

      const result = cloudinaryService.getOptimizedUrl(publicId);

      expect(result).toBe(mockUrl);
    });
  });
});
