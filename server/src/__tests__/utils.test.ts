import { describe, it, expect } from 'vitest';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

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
});
