"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allocationService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.allocationService = {
    async getAllAllocations(query) {
        const where = {};
        if (query.status) {
            where.status = query.status;
        }
        return prisma_js_1.prisma.allocation.findMany({
            where,
            include: {
                asset: { select: { id: true, name: true, serialNo: true } },
                user: { select: { id: true, name: true, department: { select: { name: true } } } },
            },
            orderBy: { allocatedAt: 'desc' },
        });
    },
    async allocateAsset(data) {
        const asset = await prisma_js_1.prisma.asset.findUnique({ where: { id: data.assetId } });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        if (asset.status !== 'AVAILABLE')
            throw new AppError_js_1.AppError('Asset is not available for allocation', 422);
        const user = await prisma_js_1.prisma.user.findUnique({ where: { id: data.userId } });
        if (!user)
            throw new AppError_js_1.AppError('User not found', 404);
        // Transaction to ensure atomicity
        return prisma_js_1.prisma.$transaction(async (tx) => {
            const allocation = await tx.allocation.create({
                data: {
                    assetId: data.assetId,
                    userId: data.userId,
                    status: 'ACTIVE',
                },
                include: {
                    asset: true,
                    user: true,
                },
            });
            await tx.asset.update({
                where: { id: data.assetId },
                data: { status: 'ALLOCATED' },
            });
            return allocation;
        });
    },
    async returnAsset(id) {
        const allocation = await prisma_js_1.prisma.allocation.findUnique({ where: { id } });
        if (!allocation)
            throw new AppError_js_1.AppError('Allocation not found', 404);
        if (allocation.status === 'RETURNED')
            throw new AppError_js_1.AppError('Asset already returned', 400);
        return prisma_js_1.prisma.$transaction(async (tx) => {
            const updatedAllocation = await tx.allocation.update({
                where: { id },
                data: {
                    status: 'RETURNED',
                    returnedAt: new Date(),
                },
            });
            await tx.asset.update({
                where: { id: allocation.assetId },
                data: { status: 'AVAILABLE' },
            });
            return updatedAllocation;
        });
    },
    async requestTransfer(id) {
        const allocation = await prisma_js_1.prisma.allocation.findUnique({ where: { id } });
        if (!allocation)
            throw new AppError_js_1.AppError('Allocation not found', 404);
        if (allocation.status !== 'ACTIVE')
            throw new AppError_js_1.AppError('Only active allocations can be transferred', 400);
        return prisma_js_1.prisma.allocation.update({
            where: { id },
            data: { status: 'TRANSFER_PENDING' },
        });
    },
    async approveTransfer(id, data) {
        const allocation = await prisma_js_1.prisma.allocation.findUnique({ where: { id } });
        if (!allocation)
            throw new AppError_js_1.AppError('Allocation not found', 404);
        if (allocation.status !== 'TRANSFER_PENDING')
            throw new AppError_js_1.AppError('Allocation is not pending transfer', 400);
        const newUser = await prisma_js_1.prisma.user.findUnique({ where: { id: data.newUserId } });
        if (!newUser)
            throw new AppError_js_1.AppError('New user not found', 404);
        return prisma_js_1.prisma.$transaction(async (tx) => {
            // Close the old allocation
            await tx.allocation.update({
                where: { id },
                data: {
                    status: 'RETURNED',
                    returnedAt: new Date(),
                },
            });
            // Create new allocation
            const newAllocation = await tx.allocation.create({
                data: {
                    assetId: allocation.assetId,
                    userId: data.newUserId,
                    status: 'ACTIVE',
                },
                include: {
                    asset: true,
                    user: true,
                },
            });
            // Asset status remains ALLOCATED, so we don't need to change it
            return newAllocation;
        });
    },
};
//# sourceMappingURL=allocation.service.js.map