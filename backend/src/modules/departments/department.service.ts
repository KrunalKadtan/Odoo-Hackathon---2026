import { prisma } from '../../config/prisma.js';
import { CreateDepartmentInput } from './department.schema.js';
import { AppError } from '../../utils/AppError.js';

export const departmentService = {
  async getAllDepartments() {
    return prisma.department.findMany({
      include: {
        head: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, assets: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },

  async createDepartment(data: CreateDepartmentInput) {
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Department with this name already exists', 409);
    }

    if (data.headId) {
      const user = await prisma.user.findUnique({ where: { id: data.headId } });
      if (!user) throw new AppError('Department head user not found', 404);
    }

    return prisma.department.create({
      data: {
        name: data.name,
        headId: data.headId || null,
      },
      include: {
        head: { select: { id: true, name: true } },
      },
    });
  },
};
