export type ReplacementInputType = "insertText" | "insertReplacementText";

export function replacementInputType(
  previousValue: string,
  nextValue: string,
  data: string,
): ReplacementInputType {
  if (nextValue === previousValue) {
    return "insertReplacementText";
  }
  if (
    nextValue.length > previousValue.length &&
    nextValue.startsWith(previousValue) &&
    nextValue.slice(previousValue.length) === data
  ) {
    return "insertText";
  }
  return "insertReplacementText";
}
