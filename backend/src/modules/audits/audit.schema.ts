import { z } from 'zod';

export const CreateAuditCycleSchema = z.object({
  name: z.string().min(3, 'Audit cycle name must be at least 3 characters'),
});

export const UpdateAuditItemSchema = z.object({
  status: z.enum(['VERIFIED', 'MISSING']),
});
