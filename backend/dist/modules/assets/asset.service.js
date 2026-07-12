"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
const AppError_js_1 = require("../../utils/AppError.js");
exports.assetService = {
    async getAllAssets(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { serialNo: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.category) {
            where.category = query.category;
        }
        return prisma_js_1.prisma.asset.findMany({
            where,
            include: {
                department: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    async getAssetById(id) {
        const asset = await prisma_js_1.prisma.asset.findUnique({
            where: { id },
            include: {
                department: { select: { id: true, name: true } },
                allocations: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { allocatedAt: 'desc' },
                },
            },
        });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        return asset;
    },
    async createAsset(data) {
        if (data.serialNo) {
            const existing = await prisma_js_1.prisma.asset.findUnique({ where: { serialNo: data.serialNo } });
            if (existing)
                throw new AppError_js_1.AppError('Asset with this serial number already exists', 409);
        }
        return prisma_js_1.prisma.asset.create({
            data: {
                name: data.name,
                category: data.category,
                serialNo: data.serialNo || null,
                purchaseDate: data.purchaseDate || null,
                value: data.value || null,
                departmentId: data.departmentId || null,
            },
        });
    },
    async updateAsset(id, data) {
        const asset = await prisma_js_1.prisma.asset.findUnique({ where: { id } });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        if (data.serialNo && data.serialNo !== asset.serialNo) {
            const existing = await prisma_js_1.prisma.asset.findUnique({ where: { serialNo: data.serialNo } });
            if (existing)
                throw new AppError_js_1.AppError('Asset with this serial number already exists', 409);
        }
        return prisma_js_1.prisma.asset.update({
            where: { id },
            data,
        });
    },
    async deleteAsset(id) {
        const asset = await prisma_js_1.prisma.asset.findUnique({ where: { id } });
        if (!asset)
            throw new AppError_js_1.AppError('Asset not found', 404);
        await prisma_js_1.prisma.asset.delete({ where: { id } });
        return null;
    },
};
//# sourceMappingURL=asset.service.js.map