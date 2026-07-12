"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.userService = {
    async getAllUsers() {
        return prisma_js_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: { select: { id: true, name: true } },
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });
    },
    async updateUserRole(id, data) {
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new AppError_js_1.AppError('User not found', 404);
        return prisma_js_1.prisma.user.update({
            where: { id },
            data: { role: data.role },
            select: { id: true, name: true, role: true },
        });
    },
};
//# sourceMappingURL=user.service.js.map