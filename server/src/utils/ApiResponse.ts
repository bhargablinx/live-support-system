export class ApiResponse<T = unknown> {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data: T;

    constructor({
        statusCode,
        message = "Success",
        data,
    }: {
        statusCode: number;
        message?: string;
        data: T;
    }) {
        this.success = true;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}