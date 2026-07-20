import { assemble, disassemble } from "es-hangul";

/** Progressive field values while typing `text` with a Hangul IME (jamo-by-jamo). */
export function hangulValueProgression(text: string): string[] {
  const jamos = disassemble(text)
    .split("")
    .filter((jamo) => jamo.trim().length > 0);
  const values: string[] = [];
  for (let i = 0; i < jamos.length; i++) {
    values.push(assemble(jamos.slice(0, i + 1)));
  }
  return values;
}

export function hangulJamos(text: string): string[] {
  return disassemble(text)
    .split("")
    .filter((jamo) => jamo.trim().length > 0);
}
