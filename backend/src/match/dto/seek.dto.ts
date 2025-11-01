import { z } from 'zod';
export const SeekSchema = z.object({
  gameId: z.string().min(1),
  mode: z.enum(['CONSOLE_VERIFIED_STREAM','CLOUD_STREAM']),
  stakeCents: z.number().int().positive(),
  region: z.string().min(1),
  eloBand: z.string().min(1),
  pingHint: z.number().int().optional(),
});
export type SeekDto = z.infer<typeof SeekSchema>;

