import { z } from "zod";

export const consoleAnalysisRequestSchema = z.object({
  consoleText: z.string().min(1, "Console output is required"),
});

export type ConsoleAnalysisRequest = z.infer<typeof consoleAnalysisRequestSchema>;