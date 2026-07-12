import { z } from 'zod';

export const CreateMaintenanceSchema = z.object({
  assetId: z.string().uuid('Asset ID must be a valid UUID'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const UpdateMaintenanceStatusSchema = z.object({
  notes: z.string().optional(),
});
