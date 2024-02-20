class ErrorHandler extends Error {
    readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;

        // Capture the stack trace
        // Error.captureStackTrace(this, this.constructor);
    }
}
export default ErrorHandler;
