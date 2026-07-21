import type { ComposedEventRecord } from "./types";
import { dispatch, snapshot, type KeyEventFields } from "./events";

export type InputEventFields = {
  inputType: string;
  data: string | null;
  isComposing?: boolean;
  value?: string;
  cancelable?: boolean;
};

/**
 * Owns the dual-write invariant: dispatch a DOM event and append a golden record.
 * Sequence helpers and composers take one `ImeTrace` instead of `(element, records)`.
 */
export class ImeTrace {
  readonly records: ComposedEventRecord[] = [];

  constructor(readonly element: HTMLInputElement | HTMLTextAreaElement) {}

  /** Single seam: dispatch DOM event + append golden record. */
  emit(
    type: keyof HTMLElementEventMap,
    init: EventInit & Record<string, unknown>,
    partial?: Partial<ComposedEventRecord>,
  ): void {
    dispatch(this.element, type, init);
    this.records.push(
      snapshot(this.element, type, {
        key: init.key as string | undefined,
        code: init.code as string | undefined,
        keyCode: init.keyCode as number | undefined,
        isComposing: init.isComposing as boolean | undefined,
        inputType: init.inputType as string | undefined,
        data: init.data as string | null | undefined,
        ...partial,
      }),
    );
  }

  keydown(init: KeyEventFields): void {
    this.emitKey("keydown", init, { cancelable: init.cancelable ?? true });
  }

  keyup(init: KeyEventFields): void {
    this.emitKey("keyup", init);
  }

  compositionStart(data: string = "", value?: string): void {
    this.emitComposition("compositionstart", data, value);
  }

  compositionUpdate(data: string, value?: string): void {
    this.emitComposition("compositionupdate", data, value, { cancelable: true });
  }

  compositionEnd(data: string, value?: string): void {
    this.emitComposition("compositionend", data, value);
  }

  beforeInput(fields: InputEventFields): void {
    this.emitInput("beforeinput", fields, { cancelable: fields.cancelable ?? true });
  }

  input(fields: InputEventFields): void {
    this.emitInput("input", fields);
  }

  append(other: ComposedEventRecord[]): void {
    this.records.push(...other);
  }

  private emitKey(
    type: "keydown" | "keyup",
    init: KeyEventFields,
    options: { cancelable?: boolean } = {},
  ): void {
    const fields = {
      key: init.key,
      code: init.code,
      keyCode: init.keyCode,
      isComposing: init.isComposing,
    };
    this.emit(
      type,
      {
        bubbles: true,
        ...(options.cancelable !== undefined ? { cancelable: options.cancelable } : {}),
        ...fields,
      },
      fields,
    );
  }

  private emitComposition(
    type: "compositionstart" | "compositionupdate" | "compositionend",
    data: string,
    value?: string,
    options: { cancelable?: boolean } = {},
  ): void {
    this.emit(
      type,
      {
        bubbles: true,
        data,
        ...(options.cancelable !== undefined ? { cancelable: options.cancelable } : {}),
      },
      value === undefined ? { data } : { data, value },
    );
  }

  private emitInput(
    type: "beforeinput" | "input",
    fields: InputEventFields,
    options: { cancelable?: boolean } = {},
  ): void {
    const { inputType, data, isComposing, value } = fields;
    const composing =
      isComposing !== undefined ? ({ isComposing } as { isComposing: boolean }) : {};
    this.emit(
      type,
      {
        bubbles: true,
        ...(options.cancelable !== undefined ? { cancelable: options.cancelable } : {}),
        inputType,
        data,
        ...composing,
      },
      {
        inputType,
        data,
        ...composing,
        ...(value !== undefined ? { value } : {}),
      },
    );
  }
}
