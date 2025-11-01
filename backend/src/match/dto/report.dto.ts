import { z } from 'zod';
export const ReportSchema = z.object({ score: z.string().min(1), evidence: z.string().optional() });
export type ReportResultDto = z.infer<typeof ReportSchema>;

