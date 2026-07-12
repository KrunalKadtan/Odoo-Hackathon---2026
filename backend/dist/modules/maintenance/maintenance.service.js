"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.maintenanceService = {
    async getAllRequests(user) {
        const where = {};
        if (user.role === 'EMPLOYEE') {
            where.raisedById = user.id;
        }
        else if (user.role === 'DEPT_HEAD' && user.departmentId) {
            where.raisedBy = { departmentId: user.departmentId };
        }
        // ADMIN and ASSET_MANAGER see everything (no filter)
        return prisma_js_1.prisma.maintenanceRequest.findMany({
            where,
            include: {
                asset: { select: { id: true, name: true, serialNo: true, status: true } },
                raisedBy: { select: { id: true, name: true, department: { select: { name: true } } } },
                approvedBy: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async createRequest(data, userId) {
        // Check asset exists
        const asset = await prisma_js_1.prisma.asset.findUnique({ where: { id: data.assetId } });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        // Asset must not already be under maintenance
        if (asset.status === 'UNDER_MAINTENANCE') {
            throw new AppError_js_1.AppError('Asset is already under maintenance', 422);
        }
        if (asset.status === 'DISPOSED' || asset.status === 'LOST') {
            throw new AppError_js_1.AppError('Cannot raise maintenance for a disposed or lost asset', 422);
        }
        // Check for an existing open request for this asset
        const existing = await prisma_js_1.prisma.maintenanceRequest.findFirst({
            where: { assetId: data.assetId, status: { in: ['REQUESTED', 'APPROVED'] } },
        });
        if (existing) {
            throw new AppError_js_1.AppError('An open maintenance request already exists for this asset', 422);
        }
        return prisma_js_1.prisma.maintenanceRequest.create({
            data: {
                assetId: data.assetId,
                raisedById: userId,
                description: data.description,
                status: 'REQUESTED',
            },
            include: {
                asset: { select: { id: true, name: true, serialNo: true } },
                raisedBy: { select: { id: true, name: true } },
            },
        });
    },
    async approveRequest(id, approverId) {
        const request = await prisma_js_1.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!request)
            throw new AppError_js_1.AppError('Maintenance request not found', 404);
        if (request.status !== 'REQUESTED') {
            throw new AppError_js_1.AppError(`Cannot approve a request with status: ${request.status}`, 422);
        }
        const [updated] = await prisma_js_1.prisma.$transaction([
            prisma_js_1.prisma.maintenanceRequest.update({
                where: { id },
                data: { status: 'APPROVED', approvedById: approverId },
                include: {
                    asset: { select: { id: true, name: true, serialNo: true } },
                    raisedBy: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, name: true } },
                },
            }),
            prisma_js_1.prisma.asset.update({
                where: { id: request.assetId },
                data: { status: 'UNDER_MAINTENANCE' },
            }),
        ]);
        return updated;
    },
    async rejectRequest(id, approverId) {
        const request = await prisma_js_1.prisma.maintenanceRequest.findUnique({ where: { id } });
        if (!request)
            throw new AppError_js_1.AppError('Maintenance request not found', 404);
        if (request.status !== 'REQUESTED') {
            throw new AppError_js_1.AppError(`Cannot reject a request with status: ${request.status}`, 422);
        }
        return prisma_js_1.prisma.maintenanceRequest.update({
            where: { id },
            data: { status: 'REJECTED', approvedById: approverId },
            include: {
                asset: { select: { id: true, name: true, serialNo: true } },
                raisedBy: { select: { id: true, name: true } },
                approvedBy: { select: { id: true, name: true } },
            },
        });
    },
    async completeRequest(id, approverId) {
        const request = await prisma_js_1.prisma.maintenanceRequest.findUnique({
            where: { id },
            include: { asset: true },
        });
        if (!request)
            throw new AppError_js_1.AppError('Maintenance request not found', 404);
        if (request.status !== 'APPROVED') {
            throw new AppError_js_1.AppError(`Cannot complete a request with status: ${request.status}`, 422);
        }
        // Check if there's an active allocation — if so, set back to ALLOCATED, else AVAILABLE
        const activeAllocation = await prisma_js_1.prisma.allocation.findFirst({
            where: { assetId: request.assetId, status: 'ACTIVE' },
        });
        const newAssetStatus = activeAllocation ? 'ALLOCATED' : 'AVAILABLE';
        const [updated] = await prisma_js_1.prisma.$transaction([
            prisma_js_1.prisma.maintenanceRequest.update({
                where: { id },
                data: { status: 'COMPLETED', approvedById: approverId },
                include: {
                    asset: { select: { id: true, name: true, serialNo: true } },
                    raisedBy: { select: { id: true, name: true } },
                    approvedBy: { select: { id: true, name: true } },
                },
            }),
            prisma_js_1.prisma.asset.update({
                where: { id: request.assetId },
                data: { status: newAssetStatus },
            }),
        ]);
        return updated;
    },
};
//# sourceMappingURL=maintenance.service.js.map