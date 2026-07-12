import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { UpdateUserRoleInput } from './user.schema.js';

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

    return prisma.user.update({
      where: { id },
      data: { role: data.role },
      select: { id: true, name: true, role: true },
    });
  },
};
