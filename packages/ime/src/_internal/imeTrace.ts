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
    this.emit(
      "keydown",
      {
        bubbles: true,
        cancelable: init.cancelable ?? true,
        key: init.key,
        code: init.code,
        keyCode: init.keyCode,
        isComposing: init.isComposing,
      },
      {
        key: init.key,
        code: init.code,
        keyCode: init.keyCode,
        isComposing: init.isComposing,
      },
    );
  }

  keyup(init: KeyEventFields): void {
    this.emit(
      "keyup",
      {
        bubbles: true,
        key: init.key,
        code: init.code,
        keyCode: init.keyCode,
        isComposing: init.isComposing,
      },
      {
        key: init.key,
        code: init.code,
        keyCode: init.keyCode,
        isComposing: init.isComposing,
      },
    );
  }

  compositionStart(data: string = "", value?: string): void {
    this.emit(
      "compositionstart",
      { bubbles: true, data },
      value === undefined ? { data } : { data, value },
    );
  }

  compositionUpdate(data: string, value?: string): void {
    this.emit(
      "compositionupdate",
      { bubbles: true, data, cancelable: true },
      value === undefined ? { data } : { data, value },
    );
  }

  compositionEnd(data: string, value?: string): void {
    this.emit(
      "compositionend",
      { bubbles: true, data },
      value === undefined ? { data } : { data, value },
    );
  }

  beforeInput(fields: InputEventFields): void {
    const { inputType, data, isComposing, value, cancelable = true } = fields;
    this.emit(
      "beforeinput",
      {
        bubbles: true,
        cancelable,
        inputType,
        data,
        ...(isComposing !== undefined ? { isComposing } : {}),
      },
      {
        inputType,
        data,
        ...(isComposing !== undefined ? { isComposing } : {}),
        ...(value !== undefined ? { value } : {}),
      },
    );
  }

  input(fields: InputEventFields): void {
    const { inputType, data, isComposing, value } = fields;
    this.emit(
      "input",
      {
        bubbles: true,
        inputType,
        data,
        ...(isComposing !== undefined ? { isComposing } : {}),
      },
      {
        inputType,
        data,
        ...(isComposing !== undefined ? { isComposing } : {}),
        ...(value !== undefined ? { value } : {}),
      },
    );
  }

  append(other: ComposedEventRecord[]): void {
    this.records.push(...other);
  }
}
