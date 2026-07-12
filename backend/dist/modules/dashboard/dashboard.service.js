"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = void 0;
const prisma_js_1 = require("../../config/prisma.js");
exports.dashboardService = {
    async getDashboardData(user) {
        const isAdminOrManager = ['ADMIN', 'ASSET_MANAGER'].includes(user.role);
        // For simplicity in the hackathon, we'll return global stats for admins/managers
        // and personalized stats for employees/dept heads.
        if (isAdminOrManager) {
            const [totalAssets, assetStatusBreakdown, totalUsers, totalDepartments, pendingMaintenance, openAudits, recentAllocations, recentMaintenance] = await Promise.all([
                prisma_js_1.prisma.asset.count(),
                prisma_js_1.prisma.asset.groupBy({ by: ['status'], _count: { status: true } }),
                prisma_js_1.prisma.user.count(),
                prisma_js_1.prisma.department.count(),
                prisma_js_1.prisma.maintenanceRequest.count({ where: { status: 'REQUESTED' } }),
                prisma_js_1.prisma.auditCycle.count({ where: { status: 'OPEN' } }),
                prisma_js_1.prisma.allocation.findMany({
                    take: 5,
                    orderBy: { allocatedAt: 'desc' },
                    include: { user: { select: { name: true } }, asset: { select: { name: true } } }
                }),
                prisma_js_1.prisma.maintenanceRequest.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { raisedBy: { select: { name: true } }, asset: { select: { name: true } } }
                })
            ]);
            const formattedBreakdown = assetStatusBreakdown.reduce((acc, curr) => {
                acc[curr.status] = curr._count.status;
                return acc;
            }, {});
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
        }
        else {
            // Employee or Dept Head - Personal Scope
            const [myAllocationsCount, myPendingMaintenanceCount, myAllocations, myMaintenance] = await Promise.all([
                prisma_js_1.prisma.allocation.count({ where: { userId: user.id, status: 'ACTIVE' } }),
                prisma_js_1.prisma.maintenanceRequest.count({ where: { raisedById: user.id, status: 'REQUESTED' } }),
                prisma_js_1.prisma.allocation.findMany({
                    where: { userId: user.id },
                    take: 5,
                    orderBy: { allocatedAt: 'desc' },
                    include: { user: { select: { name: true } }, asset: { select: { name: true } } }
                }),
                prisma_js_1.prisma.maintenanceRequest.findMany({
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
//# sourceMappingURL=dashboard.service.js.map