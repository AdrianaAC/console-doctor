import type { ParsedErrorBlock } from "@/types/diagnosis";

const ERROR_PREFIXES = [
  "Error:",
  "TypeError:",
  "ReferenceError:",
  "SyntaxError:",
  "RangeError:",
  "Unhandled Runtime Error",
  "Build error",
  "Failed to compile",
];

function looksLikeErrorStart(line: string) {
  return ERROR_PREFIXES.some((prefix) => line.includes(prefix));
}

function extractFileLine(text: string) {
  const match =
    text.match(/([A-Za-z0-9_./\\-]+\.(tsx|ts|js|jsx)):(\d+):(\d+)/) ||
    text.match(/([A-Za-z0-9_./\\-]+\.(tsx|ts|js|jsx))\s*\((\d+):(\d+)\)/);

  if (!match) return { file: undefined, line: undefined, column: undefined };

  return {
    file: match[1],
    line: Number(match[3] ?? match[2]),
    column: Number(match[4] ?? match[3]),
  };
}

function extractErrorType(text: string) {
  const match = text.match(
    /(TypeError|ReferenceError|SyntaxError|RangeError|Error)/,
  );
  return match?.[1];
}

export function extractErrorBlocks(consoleText: string): ParsedErrorBlock[] {
  const lines = consoleText.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (looksLikeErrorStart(line) && current.length > 0) {
      blocks.push(current.join("\n").trim());
      current = [line];
      continue;
    }

    if (line.trim()) {
      current.push(line);
    } else if (current.length > 0) {
      current.push(line);
    }
  }

  if (current.length > 0) {
    blocks.push(current.join("\n").trim());
  }

  return blocks
    .map((raw) => {
      const { file, line, column } = extractFileLine(raw);
      const errorType = extractErrorType(raw);
      const firstMeaningfulLine =
        raw.split("\n").find((line) => line.trim().length > 0)?.trim() ??
        "Unknown error";

      return {
        raw,
        errorType,
        message: firstMeaningfulLine,
        file,
        line,
        column,
      };
    })
    .filter((block) => block.message);
}