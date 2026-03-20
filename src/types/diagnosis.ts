export type ParsedErrorBlock = {
  raw: string;
  errorType?: string;
  message: string;
  file?: string;
  line?: number;
  column?: number;
  framework?: string;
  isPrimaryCandidate?: boolean;
};

export type DiagnosisResult = {
  framework: string | null;
  summary: string;
  rootCause: string;
  where: string | null;
  why: string;
  fixSteps: string[];
  confidence: number;
  parsedErrors: ParsedErrorBlock[];
};