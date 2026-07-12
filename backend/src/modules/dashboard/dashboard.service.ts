import { prisma } from '../../config/prisma.js';

export const dashboardService = {
  async getDashboardData(user: { id: string; role: string }) {
    const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(user.role);
    
    // For simplicity in the hackathon, we'll return global stats for admins/managers
    // and personalized stats for employees/dept heads.

    if (isAdminOrManager) {
      const [
        totalAssets,
        assetStatusBreakdown,
        totalUsers,
        totalDepartments,
        pendingMaintenance,
        openAudits,
        recentAllocations,
        recentMaintenance
      ] = await Promise.all([
        prisma.asset.count(),
        prisma.asset.groupBy({ by: ['status'], _count: { status: true } }),
        prisma.user.count(),
        prisma.department.count(),
        prisma.maintenanceRequest.count({ where: { status: 'REQUESTED' } }),
        prisma.auditCycle.count({ where: { status: 'OPEN' } }),
        prisma.allocation.findMany({
          take: 5,
          orderBy: { allocatedAt: 'desc' },
          include: { user: { select: { name: true } }, asset: { select: { name: true } } }
        }),
        prisma.maintenanceRequest.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { raisedBy: { select: { name: true } }, asset: { select: { name: true } } }
        })
      ]);

      const formattedBreakdown = assetStatusBreakdown.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>);

      return {
        scope: 'GLOBAL',
        stats: {
          totalAssets,
          assetStatusBreakdown: formattedBreakdown,
          totalUsers,
          totalDepartments,
          pendingMaintenance,
          openAudits
        },
        activity: {
          allocations: recentAllocations,
          maintenance: recentMaintenance
        }
      };
    } else {
      // Employee or Dept Head - Personal Scope
      const [
        myAllocationsCount,
        myPendingMaintenanceCount,
        myAllocations,
        myMaintenance
      ] = await Promise.all([
        prisma.allocation.count({ where: { userId: user.id, status: 'ACTIVE' } }),
        prisma.maintenanceRequest.count({ where: { raisedById: user.id, status: 'REQUESTED' } }),
        prisma.allocation.findMany({
          where: { userId: user.id },
          take: 5,
          orderBy: { allocatedAt: 'desc' },
          include: { user: { select: { name: true } }, asset: { select: { name: true } } }
        }),
        prisma.maintenanceRequest.findMany({
          where: { raisedById: user.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { raisedBy: { select: { name: true } }, asset: { select: { name: true } } }
        })
      ]);

      return {
        scope: 'PERSONAL',
        stats: {
          activeAllocations: myAllocationsCount,
          pendingMaintenance: myPendingMaintenanceCount,
        },
        activity: {
          allocations: myAllocations,
          maintenance: myMaintenance
        }
      };
    }
  }
};
