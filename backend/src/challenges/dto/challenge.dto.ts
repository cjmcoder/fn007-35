import { z } from 'zod';
export const CreateChallengeSchema = z.object({
  gameId: z.string(), mode: z.enum(['CONSOLE_VERIFIED_STREAM','CLOUD_STREAM']),
  stakeCents: z.number().int().positive(), rulesetId: z.string().optional(),
  region: z.string(), eloBand: z.string(),
});
export type CreateChallengeDto = z.infer<typeof CreateChallengeSchema>;

