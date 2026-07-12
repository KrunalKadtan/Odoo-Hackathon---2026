import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { CreateAssetInput, UpdateAssetInput } from './asset.schema.js';
import { Prisma } from '@prisma/client';

export const assetService = {
  async getAllAssets(query: { search?: string; status?: string; category?: string }) {
    const where: Prisma.AssetWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { serialNo: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status as any;
    }

    if (query.category) {
      where.category = query.category;
    }

    return prisma.asset.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAssetById(id: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        allocations: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { allocatedAt: 'desc' },
        },
      },
    });

    if (!asset) throw new AppError('Asset not found', 404);
    return asset;
  },

  async createAsset(data: CreateAssetInput) {
    if (data.serialNo) {
      const existing = await prisma.asset.findUnique({ where: { serialNo: data.serialNo } });
      if (existing) throw new AppError('Asset with this serial number already exists', 409);
    }

    return prisma.asset.create({
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

  async updateAsset(id: string, data: UpdateAssetInput) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Asset not found', 404);

    if (data.serialNo && data.serialNo !== asset.serialNo) {
      const existing = await prisma.asset.findUnique({ where: { serialNo: data.serialNo } });
      if (existing) throw new AppError('Asset with this serial number already exists', 409);
    }

    return prisma.asset.update({
      where: { id },
      data,
    });
  },

  async deleteAsset(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new AppError('Asset not found', 404);

    await prisma.asset.delete({ where: { id } });
    return null;
  },
};
