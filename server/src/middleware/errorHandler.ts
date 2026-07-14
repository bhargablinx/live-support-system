import { type NextFunction, type Request, type Response } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    return res.status(err.statusCode || 500).json({
        success: false,
        statusCode: err.statusCode || 500,
        message: err.message || "Internal Server Error",
        error: err.error || "Internal Server Error",
        errors: err.errors || [],
    });
};

export { errorHandler };