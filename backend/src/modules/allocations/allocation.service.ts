import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { CreateAllocationInput, ApproveTransferInput } from './allocation.schema.js';

export const allocationService = {
  async getAllAllocations(query: { status?: string }, user: { id: string, role: string, departmentId: string | null }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    if (user.role === 'EMPLOYEE') {
      where.userId = user.id;
    } else if (user.role === 'DEPT_HEAD' && user.departmentId) {
      // DEPT_HEAD sees their own allocations + all allocations for their department
      where.OR = [
        { userId: user.id },
        { user: { departmentId: user.departmentId } }
      ];
    }

    return prisma.allocation.findMany({
      where,
      include: {
        asset: { select: { id: true, name: true, serialNo: true } },
        user: { select: { id: true, name: true, department: { select: { name: true } } } },
      },
      orderBy: { allocatedAt: 'desc' },
    });
  },

  async allocateAsset(data: CreateAllocationInput) {
    const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new AppError('Asset not found', 404);
    if (asset.status !== 'AVAILABLE') throw new AppError('Asset is not available for allocation', 422);

    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new AppError('User not found', 404);

    // Transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.create({
        data: {
          assetId: data.assetId,
          userId: data.userId,
          expectedReturnDate: data.expectedReturnDate || null,
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

  async returnAsset(id: string) {
    const allocation = await prisma.allocation.findUnique({ where: { id } });
    if (!allocation) throw new AppError('Allocation not found', 404);
    if (allocation.status === 'RETURNED') throw new AppError('Asset already returned', 400);

    return prisma.$transaction(async (tx) => {
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

  async requestTransfer(id: string) {
    const allocation = await prisma.allocation.findUnique({ where: { id } });
    if (!allocation) throw new AppError('Allocation not found', 404);
    if (allocation.status !== 'ACTIVE') throw new AppError('Only active allocations can be transferred', 400);

    return prisma.allocation.update({
      where: { id },
      data: { status: 'TRANSFER_PENDING' },
    });
  },

  async approveTransfer(id: string, data: ApproveTransferInput) {
    const allocation = await prisma.allocation.findUnique({ where: { id } });
    if (!allocation) throw new AppError('Allocation not found', 404);
    if (allocation.status !== 'TRANSFER_PENDING') throw new AppError('Allocation is not pending transfer', 400);

    const newUser = await prisma.user.findUnique({ where: { id: data.newUserId } });
    if (!newUser) throw new AppError('New user not found', 404);

    return prisma.$transaction(async (tx) => {
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
