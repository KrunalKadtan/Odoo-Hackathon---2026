"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AppError_js_1 = require("../utils/AppError.js");
const env_js_1 = require("../config/env.js");
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError_js_1.AppError('You are not logged in. Please log in to get access.', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new AppError_js_1.AppError('Invalid token or token expired.', 401));
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError_js_1.AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.middleware.js.map