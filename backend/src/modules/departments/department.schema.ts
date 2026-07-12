import { z } from 'zod';

export const CreateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  headId: z.string().uuid('Invalid user ID').optional().nullable(),
});

export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;
