import { z } from 'zod';

export const CreateAllocationSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  userId: z.string().uuid('Invalid user ID'),
});

export const ApproveTransferSchema = z.object({
  newUserId: z.string().uuid('Invalid user ID'),
});

export type CreateAllocationInput = z.infer<typeof CreateAllocationSchema>;
export type ApproveTransferInput = z.infer<typeof ApproveTransferSchema>;
