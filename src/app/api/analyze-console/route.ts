import { NextResponse } from "next/server";
import { consoleAnalysisRequestSchema } from "@/schemas/console-analysis-schema";
import { extractErrorBlocks } from "@/lib/console/extract-error-blocks";
import { detectPrimaryError } from "@/lib/console/detect-primary-error";
import type { DiagnosisResult } from "@/types/diagnosis";

function detectFramework(consoleText: string): string | null {
  if (/next\.js|next\/dist|Unhandled Runtime Error/i.test(consoleText)) return "Next.js";
  if (/react-dom|react\.development|Invalid hook call/i.test(consoleText)) return "React";
  if (/vite/i.test(consoleText)) return "Vite";
  if (/tsc|typescript|TS\d{4}/i.test(consoleText)) return "TypeScript";
  if (/vitest|jest/i.test(consoleText)) return "Testing";
  if (/eslint/i.test(consoleText)) return "ESLint";
  if (/npm|pnpm|yarn ERR!/i.test(consoleText)) return "Package manager";
  return null;
}

function scoreConfidence(primaryErrorFound: boolean, hasFile: boolean, hasKnownType: boolean) {
  let score = 40;
  if (primaryErrorFound) score += 20;
  if (hasFile) score += 20;
  if (hasKnownType) score += 20;
  return Math.min(score, 100);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = consoleAnalysisRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { consoleText } = parsed.data;

    const parsedErrors = extractErrorBlocks(consoleText);
    const primary = detectPrimaryError(parsedErrors);
    const framework = detectFramework(consoleText);

    const result: DiagnosisResult = {
      framework,
      summary: primary
        ? `Most likely primary issue: ${primary.message}`
        : "No clear primary error could be identified.",
      rootCause: primary?.message ?? "Unable to determine root cause.",
      where: primary?.file
        ? `${primary.file}${primary.line ? `:${primary.line}` : ""}`
        : null,
      why: primary
        ? "This error appears to be the first meaningful failure in the console output, and later messages may be secondary effects."
        : "The console output did not contain a clearly identifiable primary error pattern.",
      fixSteps: primary
        ? [
            "Open the referenced file and inspect the failing line.",
            "Check whether the variable, import, prop, or dependency is undefined or incorrectly named.",
            "Fix the primary error first, then rerun the app to see which secondary errors disappear.",
          ]
        : [
            "Review the earliest error in the console output.",
            "Provide more surrounding lines or stack trace context.",
            "Include framework info or the related source snippet for better analysis.",
          ],
      confidence: scoreConfidence(!!primary, !!primary?.file, !!primary?.errorType),
      parsedErrors,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to analyze console output." },
      { status: 500 },
    );
  }
}