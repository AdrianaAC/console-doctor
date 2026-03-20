import type { ParsedErrorBlock } from "@/types/diagnosis";

const IMPORTANT_PATTERNS = [
  "Failed to compile",
  "Unhandled Runtime Error",
  "TypeError",
  "ReferenceError",
  "Cannot read properties of undefined",
  "is not defined",
  "Module not found",
  "Invalid hook call",
];

export function detectPrimaryError(blocks: ParsedErrorBlock[]): ParsedErrorBlock | null {
  if (!blocks.length) return null;

  for (const pattern of IMPORTANT_PATTERNS) {
    const match = blocks.find(
      (block) => block.raw.includes(pattern) || block.message.includes(pattern),
    );
    if (match) return match;
  }

  return blocks[0];
}