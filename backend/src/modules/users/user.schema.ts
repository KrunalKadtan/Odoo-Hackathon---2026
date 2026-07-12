import { z } from 'zod';

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['EMPLOYEE', 'DEPT_HEAD', 'ASSET_MANAGER', 'ADMIN']),
});

export const UpdateUserDepartmentSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
export type UpdateUserDepartmentInput = z.infer<typeof UpdateUserDepartmentSchema>;
