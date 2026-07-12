"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.departmentService = {
    async getAllDepartments() {
        return prisma_js_1.prisma.department.findMany({
            include: {
                head: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: { members: true, assets: true },
                },
            },
            orderBy: { name: 'asc' },
        });
    },
    async createDepartment(data) {
        const existing = await prisma_js_1.prisma.department.findUnique({
            where: { name: data.name },
        });
        if (existing) {
            throw new AppError_js_1.AppError('Department with this name already exists', 409);
        }
        if (data.headId) {
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: data.headId } });
            if (!user)
                throw new AppError_js_1.AppError('Department head user not found', 404);
        }
        return prisma_js_1.prisma.department.create({
            data: {
                name: data.name,
                headId: data.headId || null,
            },
            include: {
                head: { select: { id: true, name: true } },
            },
        });
    },
};
//# sourceMappingURL=department.service.js.map