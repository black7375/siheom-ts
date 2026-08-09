export type TypeSegment = { kind: "hangul"; text: string } | { kind: "keys"; text: string };

const HANGUL_CHAR = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function isHangulChar(char: string): boolean {
  return HANGUL_CHAR.test(char);
}

function appendSegment(segments: TypeSegment[], kind: TypeSegment["kind"], chunk: string): void {
  if (!chunk) return;
  const last = segments[segments.length - 1];
  if (last && last.kind === kind) {
    last.text += chunk;
    return;
  }
  segments.push({ kind, text: chunk });
}

/** End of a `{Name}` descriptor; an unclosed `{` swallows the rest of the string. */
function braceRunEnd(text: string, start: number): number {
  const close = text.indexOf("}", start + 1);
  return close === -1 ? text.length : close + 1;
}

function hangulRunEnd(text: string, start: number): number {
  let end = start + 1;
  while (end < text.length && isHangulChar(text[end] ?? "")) end++;
  return end;
}

function keysRunEnd(text: string, start: number): number {
  let end = start + 1;
  while (end < text.length) {
    const next = text[end] ?? "";
    if (next === "{" || isHangulChar(next)) break;
    end++;
  }
  return end;
}

function nextRun(text: string, start: number): { kind: TypeSegment["kind"]; end: number } {
  if (text[start] === "{") return { kind: "keys", end: braceRunEnd(text, start) };
  if (isHangulChar(text[start] ?? "")) return { kind: "hangul", end: hangulRunEnd(text, start) };
  return { kind: "keys", end: keysRunEnd(text, start) };
}

/**
 * Split a user-event-style type string into Hangul compose runs vs keyboard runs.
 * `{Enter}`-style descriptors stay in `keys` segments.
 */
export function segmentTypeText(text: string): TypeSegment[] {
  const segments: TypeSegment[] = [];
  let index = 0;

  while (index < text.length) {
    const run = nextRun(text, index);
    appendSegment(segments, run.kind, text.slice(index, run.end));
    index = run.end;
  }

  return segments;
}
