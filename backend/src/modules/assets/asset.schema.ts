import { z } from 'zod';

export const CreateAssetSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  category: z.string().min(2, 'Category is required'),
  serialNo: z.string().optional().nullable(),
  assetTag: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable(),
  value: z.number().nonnegative().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
});

export const UpdateAssetSchema = CreateAssetSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'LOST', 'DISPOSED']).optional(),
});

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>;
