import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { createEditor } from "slate";
import { withReact } from "slate-react";

import { useSlatePlaceholderAlternativeEditableProps } from "./useSlatePlaceholderAlternativeEditableProps";

describe("useSlatePlaceholderAlternativeEditableProps", () => {
  it("alt-a wires anchor handlers only (no renderPlaceholder guard path)", () => {
    const editor = withReact(createEditor());
    const { result } = renderHook(() =>
      useSlatePlaceholderAlternativeEditableProps({ editor, mode: "alt-a" }),
    );

    expect(result.current.onKeyDown).toBeTypeOf("function");
    expect(result.current.onCompositionStart).toBeTypeOf("function");
    expect(result.current.onCompositionEnd).toBeUndefined();
    expect(result.current.renderPlaceholder).toBeUndefined();
  });

  it("alt-b wires guard + placeholder hide (no anchor keydown)", () => {
    const editor = withReact(createEditor());
    const { result } = renderHook(() =>
      useSlatePlaceholderAlternativeEditableProps({ editor, mode: "alt-b" }),
    );

    expect(result.current.onKeyDown).toBeUndefined();
    expect(result.current.onCompositionStart).toBeUndefined();
    expect(result.current.onCompositionEnd).toBeTypeOf("function");
    expect(result.current.renderPlaceholder).toBeTypeOf("function");
  });

  it("alt-c combines anchor + guard", () => {
    const editor = withReact(createEditor());
    const { result } = renderHook(() =>
      useSlatePlaceholderAlternativeEditableProps({ editor, mode: "alt-c" }),
    );

    expect(result.current.onKeyDown).toBeTypeOf("function");
    expect(result.current.onCompositionStart).toBeTypeOf("function");
    expect(result.current.onCompositionEnd).toBeTypeOf("function");
    expect(result.current.renderPlaceholder).toBeTypeOf("function");
  });
});
