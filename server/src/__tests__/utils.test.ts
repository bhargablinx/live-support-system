import { describe, it, expect } from 'vitest';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { extractPublicIdFromUrl, deleteFromCloudinary } from '../utils/uploadToCloudinary.js';

describe('Utility Helper Classes', () => {
  describe('ApiError', () => {
    it('should construct ApiError with default 500 status code and success false', () => {
      const err = new ApiError({ message: 'Something went wrong' });

      expect(err.message).toBe('Something went wrong');
      expect(err.statusCode).toBe(500);
      expect(err.success).toBe(false);
      expect(err.error).toBe('Internal Server Error');
    });

    it('should construct ApiError with custom status code and custom error name', () => {
      const err = new ApiError({
        message: 'Invalid input parameters',
        statusCode: 400,
        error: 'Bad Request',
      });

      expect(err.message).toBe('Invalid input parameters');
      expect(err.statusCode).toBe(400);
      expect(err.error).toBe('Bad Request');
      expect(err.success).toBe(false);
    });
  });

  describe('ApiResponse', () => {
    it('should construct ApiResponse with success flag and data payload', () => {
      const payload = { id: '123', name: 'Test Item' };
      const res = new ApiResponse({
        statusCode: 200,
        message: 'Success',
        data: payload,
      });

      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('Success');
      expect(res.data).toEqual(payload);
      expect(res.success).toBe(true);
    });
  });

  describe('Cloudinary Utilities', () => {
    it('should correctly extract public_id from Cloudinary URLs', () => {
      const url1 = 'https://res.cloudinary.com/demo/image/upload/v1573752372/sample.jpg';
      expect(extractPublicIdFromUrl(url1)).toBe('sample');

      const url2 = 'https://res.cloudinary.com/demo/image/upload/v1573752372/folder/subfolder/file_name.png';
      expect(extractPublicIdFromUrl(url2)).toBe('folder/subfolder/file_name');

      const url3 = 'https://res.cloudinary.com/demo/raw/upload/attachments/doc.pdf';
      expect(extractPublicIdFromUrl(url3)).toBe('attachments/doc');

      expect(extractPublicIdFromUrl('')).toBe('');
      expect(extractPublicIdFromUrl('invalid_url')).toBe('');
    });

    it('should handle deleteFromCloudinary gracefully when URL is empty or invalid', async () => {
      const res1 = await deleteFromCloudinary('');
      expect(res1).toBeNull();

      const res2 = await deleteFromCloudinary('invalid_url');
      expect(res2).toBeNull();
    });
  });
});
