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
            if (user.role !== 'DEPT_HEAD' && user.role !== 'ADMIN') {
                throw new AppError_js_1.AppError('Only users with DEPT_HEAD or ADMIN roles can be assigned as a department head.', 400);
            }
        }
        const department = await prisma_js_1.prisma.department.create({
            data: {
                name: data.name,
                headId: data.headId || null,
            },
            include: {
                head: { select: { id: true, name: true } },
            },
        });
        if (data.headId) {
            await prisma_js_1.prisma.department.updateMany({
                where: { headId: data.headId, id: { not: department.id } },
                data: { headId: null }
            });
            await prisma_js_1.prisma.user.update({
                where: { id: data.headId },
                data: { departmentId: department.id }
            });
        }
        return department;
    },
    async updateDepartment(id, data) {
        const department = await prisma_js_1.prisma.department.findUnique({ where: { id } });
        if (!department)
            throw new AppError_js_1.AppError('Department not found', 404);
        if (data.headId) {
            const user = await prisma_js_1.prisma.user.findUnique({ where: { id: data.headId } });
            if (!user)
                throw new AppError_js_1.AppError('Department head user not found', 404);
            if (user.role !== 'DEPT_HEAD' && user.role !== 'ADMIN') {
                throw new AppError_js_1.AppError('Only users with DEPT_HEAD or ADMIN roles can be assigned as a department head.', 400);
            }
        }
        const updatedDepartment = await prisma_js_1.prisma.department.update({
            where: { id },
            data: {
                headId: data.headId || null,
            },
            include: {
                head: { select: { id: true, name: true } },
            },
        });
        if (data.headId) {
            await prisma_js_1.prisma.department.updateMany({
                where: { headId: data.headId, id: { not: id } },
                data: { headId: null }
            });
            await prisma_js_1.prisma.user.update({
                where: { id: data.headId },
                data: { departmentId: id }
            });
        }
        return updatedDepartment;
    },
};
//# sourceMappingURL=department.service.js.map