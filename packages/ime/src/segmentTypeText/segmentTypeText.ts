export type TypeSegment = { kind: "hangul"; text: string } | { kind: "keys"; text: string };

const HANGUL_CHAR = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3]/;

function isHangulChar(char: string): boolean {
  return HANGUL_CHAR.test(char);
}

/**
 * Split a user-event-style type string into Hangul compose runs vs keyboard runs.
 * `{Enter}`-style descriptors stay in `keys` segments.
 */
export function segmentTypeText(text: string): TypeSegment[] {
  const segments: TypeSegment[] = [];
  let i = 0;

  const push = (kind: TypeSegment["kind"], chunk: string) => {
    if (!chunk) return;
    const last = segments[segments.length - 1];
    if (last && last.kind === kind) {
      last.text += chunk;
      return;
    }
    segments.push({ kind, text: chunk });
  };

  while (i < text.length) {
    if (text[i] === "{") {
      const end = text.indexOf("}", i + 1);
      if (end === -1) {
        push("keys", text.slice(i));
        break;
      }
      push("keys", text.slice(i, end + 1));
      i = end + 1;
      continue;
    }

    const char = text[i] ?? "";
    if (isHangulChar(char)) {
      let j = i + 1;
      while (j < text.length && isHangulChar(text[j] ?? "")) j++;
      push("hangul", text.slice(i, j));
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < text.length) {
      const next = text[j] ?? "";
      if (next === "{" || isHangulChar(next)) break;
      j++;
    }
    push("keys", text.slice(i, j));
    i = j;
  }

  return segments;
}
