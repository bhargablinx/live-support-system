import { describe, it, expect, vi } from 'vitest';
import { errorHandler } from '../errorHandler.js';
import { ApiError } from '../../utils/ApiError.js';

describe('Global Error Handler Middleware Unit Tests', () => {
  it('should format custom ApiError into structured JSON response', () => {
    const apiErr = new ApiError({
      statusCode: 404,
      message: 'Resource not found',
      error: 'Not Found',
    });

    const req: any = {};
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    errorHandler(apiErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 404,
      message: 'Resource not found',
      error: 'Not Found',
      errors: [],
    });
  });

  it('should fallback to 500 status code for standard generic Error', () => {
    const genericErr = new Error('Unexpected crash');

    const req: any = {};
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();

    errorHandler(genericErr, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      message: 'Unexpected crash',
      error: 'Internal Server Error',
      errors: [],
    });
  });
});
