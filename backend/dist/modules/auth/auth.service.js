"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../../config/prisma.js");
const env_js_1 = require("../../config/env.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.authService = {
    async signup(data) {
        const existingUser = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new AppError_js_1.AppError('Email is already registered', 409);
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 12);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: 'EMPLOYEE', // Default role to prevent privilege escalation
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, env_js_1.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        return { token, user };
    },
    async login(data) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new AppError_js_1.AppError('Invalid email or password', 401);
        }
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
        if (!isPasswordValid) {
            throw new AppError_js_1.AppError('Invalid email or password', 401);
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, env_js_1.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        const { password, ...userWithoutPassword } = user;
        return { token, user: userWithoutPassword };
    },
};
//# sourceMappingURL=auth.service.js.map