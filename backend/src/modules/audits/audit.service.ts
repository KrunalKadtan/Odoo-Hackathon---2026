import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';

export const auditService = {
  async getAllCycles() {
    return prisma.auditCycle.findMany({
      include: {
        _count: { select: { items: true } },
        items: {
          select: { status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getCycleById(id: string) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: {
              select: {
                id: true,
                name: true,
                serialNo: true,
                category: true,
                status: true,
                department: { select: { name: true } },
              },
            },
          },
          orderBy: { asset: { name: 'asc' } },
        },
      },
    });
    if (!cycle) throw new AppError('Audit cycle not found', 404);
    return cycle;
  },

  async createCycle(name: string) {
    // Get all auditable assets (AVAILABLE and ALLOCATED)
    const assets = await prisma.asset.findMany({
      where: { 
        status: { in: ['AVAILABLE', 'ALLOCATED'] },
        category: { not: 'Room' }
      },
      select: { id: true },
    });

    if (assets.length === 0) {
      throw new AppError('No auditable assets found to create an audit cycle', 422);
    }

    return prisma.auditCycle.create({
      data: {
        name,
        items: {
          create: assets.map((asset) => ({ assetId: asset.id })),
        },
      },
      include: {
        _count: { select: { items: true } },
      },
    });
  },

  async updateItem(cycleId: string, itemId: string, status: 'VERIFIED' | 'MISSING') {
    // Verify item belongs to this cycle
    const item = await prisma.auditItem.findFirst({
      where: { id: itemId, cycleId },
      include: { cycle: true },
    });
    if (!item) throw new AppError('Audit item not found', 404);
    if (item.cycle.status === 'CLOSED') {
      throw new AppError('Cannot update items in a closed audit cycle', 422);
    }

    const updatedItem = await prisma.auditItem.update({
      where: { id: itemId },
      data: { status },
      include: {
        asset: { select: { id: true, name: true, serialNo: true, status: true } },
      },
    });

    // If flagged as MISSING, update asset status to LOST
    if (status === 'MISSING') {
      await prisma.asset.update({
        where: { id: updatedItem.asset.id },
        data: { status: 'LOST' },
      });
    }

    return updatedItem;
  },

  async closeCycle(id: string) {
    const cycle = await prisma.auditCycle.findUnique({ 
      where: { id },
      include: { items: true }
    });
    if (!cycle) throw new AppError('Audit cycle not found', 404);
    if (cycle.status === 'CLOSED') {
      throw new AppError('Audit cycle is already closed', 422);
    }
    
    const hasPending = cycle.items.some(item => item.status === 'PENDING');
    if (hasPending) {
      throw new AppError('Cannot close audit cycle. All items must be VERIFIED or MISSING.', 422);
    }

    return prisma.auditCycle.update({
      where: { id },
      data: { status: 'CLOSED', endDate: new Date() },
      include: { _count: { select: { items: true } } },
    });
  },
};
