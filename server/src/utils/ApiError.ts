export class ApiError extends Error {
    public readonly success = false;
    public readonly statusCode: number;
    public readonly error: string;
    public readonly errors?: unknown;

    constructor({
        message,
        statusCode = 500,
        error = "Internal Server Error",
        errors,
    }: {
        message: string;
        statusCode?: number;
        error?: string;
        errors?: unknown;
    }) {
        super(message);

        this.statusCode = statusCode;
        this.error = error;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}