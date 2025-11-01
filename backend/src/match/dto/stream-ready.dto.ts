import { z } from 'zod';
export const StreamReadySchema = z.object({
  streamUrl: z.string().url(),
  overlayNonce: z.string().min(4),
});
export type StreamReadyDto = z.infer<typeof StreamReadySchema>;

