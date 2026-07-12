import { prisma } from '../../config/prisma.js';
import { CreateDepartmentInput, UpdateDepartmentInput } from './department.schema.js';
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

    const department = await prisma.department.create({
      data: {
        name: data.name,
        headId: data.headId || null,
      },
      include: {
        head: { select: { id: true, name: true } },
      },
    });

    if (data.headId) {
      await prisma.user.update({
        where: { id: data.headId },
        data: { departmentId: department.id }
      });
    }

    return department;
  },

  async updateDepartment(id: string, data: UpdateDepartmentInput) {
    const department = await prisma.department.findUnique({ where: { id } });
    if (!department) throw new AppError('Department not found', 404);

    if (data.headId) {
      const user = await prisma.user.findUnique({ where: { id: data.headId } });
      if (!user) throw new AppError('Department head user not found', 404);
    }

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        headId: data.headId || null,
      },
      include: {
        head: { select: { id: true, name: true } },
      },
    });

    if (data.headId) {
      await prisma.user.update({
        where: { id: data.headId },
        data: { departmentId: id }
      });
    }

    return updatedDepartment;
  },
};
