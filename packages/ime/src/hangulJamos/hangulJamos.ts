import { disassemble } from "es-hangul";

/** Jamo sequence for Hangul `text` (whitespace stripped). */
export function hangulJamos(text: string): string[] {
  return disassemble(text)
    .split("")
    .filter((jamo) => jamo.trim().length > 0);
}
