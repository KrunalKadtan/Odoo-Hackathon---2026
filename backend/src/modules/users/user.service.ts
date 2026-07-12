import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { UpdateUserRoleInput, UpdateUserDepartmentInput } from './user.schema.js';

export const userService = {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: { select: { id: true, name: true } },
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  },

  async updateUserRole(id: string, data: UpdateUserRoleInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    if (data.role === 'EMPLOYEE' || data.role === 'ASSET_MANAGER') {
      await prisma.department.updateMany({
        where: { headId: id },
        data: { headId: null },
      });
    }

    return prisma.user.update({
      where: { id },
      data: { role: data.role },
      select: { id: true, name: true, role: true },
    });
  },

  async updateUserDepartment(id: string, data: UpdateUserDepartmentInput) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    if (user.departmentId !== data.departmentId) {
      await prisma.department.updateMany({
        where: { headId: id },
        data: { headId: null },
      });
    }

    return prisma.user.update({
      where: { id },
      data: { departmentId: data.departmentId || null },
      select: { id: true, name: true, department: { select: { id: true, name: true } } },
    });
  },
};
