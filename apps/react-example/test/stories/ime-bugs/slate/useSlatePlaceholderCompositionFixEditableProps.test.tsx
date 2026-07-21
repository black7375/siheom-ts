import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { createEditor } from "slate";
import { withReact } from "slate-react";

import { useSlatePlaceholderCompositionFixEditableProps } from "./useSlatePlaceholderCompositionFixEditableProps";

describe("useSlatePlaceholderCompositionFixEditableProps fixLevel", () => {
  it("minimal omits onDOMBeforeInput (no preedit drive)", () => {
    const editor = withReact(createEditor());
    const { result } = renderHook(() =>
      useSlatePlaceholderCompositionFixEditableProps({
        editor,
        editable: null,
        fixLevel: "minimal",
      }),
    );

    expect(result.current.onDOMBeforeInput).toBeUndefined();
    expect(result.current.onCompositionStart).toBeTypeOf("function");
    expect(result.current.renderPlaceholder).toBeTypeOf("function");
  });

  it("full includes onDOMBeforeInput", () => {
    const editor = withReact(createEditor());
    const { result } = renderHook(() =>
      useSlatePlaceholderCompositionFixEditableProps({
        editor,
        editable: null,
        fixLevel: "full",
      }),
    );

    expect(result.current.onDOMBeforeInput).toBeTypeOf("function");
  });
});
