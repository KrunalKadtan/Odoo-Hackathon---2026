"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_js_1 = require("../utils/AppError.js");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError_js_1.AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const zodError = err;
        const errorMessages = zodError.errors?.map((issue) => issue.message).join(', ');
        res.status(400).json({
            status: 'error',
            message: errorMessages || 'Validation failed',
            errors: zodError.errors,
        });
        return;
    }
    console.error('UNHANDLED ERROR 💥', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map