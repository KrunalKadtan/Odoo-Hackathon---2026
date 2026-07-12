import { z } from 'zod';

export const UpdateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE']),
});

export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;
