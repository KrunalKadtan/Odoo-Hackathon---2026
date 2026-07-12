import { z } from 'zod';

export const CreateBookingSchema = z.object({
  resourceId: z.string().uuid('Invalid resource ID'),
  userId: z.string().uuid('Invalid user ID'),
  startTime: z.string().datetime('Invalid start time'),
  endTime: z.string().datetime('Invalid end time'),
}).refine(data => new Date(data.startTime) < new Date(data.endTime), {
  message: 'End time must be after start time',
  path: ['endTime']
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
