import * as SlateReact from "slate-react";

/** Set in `patches/slate-react@0.126.0.patch` — absent if Storybook/Vite served stale bundle. */
export const EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID = "composition-anchor-v3";

export function readSlatePatchProbe(): {
  expectedPatchId: string;
  loadedPatchId: string | null;
  patchActive: boolean;
} {
  const loadedPatchId =
    (SlateReact as { SLATE_ANDROID_HANGUL_PATCH_ID?: string }).SLATE_ANDROID_HANGUL_PATCH_ID ??
    null;

  return {
    expectedPatchId: EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
    loadedPatchId,
    patchActive: loadedPatchId === EXPECTED_SLATE_ANDROID_HANGUL_PATCH_ID,
  };
}
