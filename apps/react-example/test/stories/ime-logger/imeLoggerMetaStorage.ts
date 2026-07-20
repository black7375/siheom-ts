import { detectImeLoggerMeta, type ImeLoggerMetaFields } from "./detectImeLoggerMeta";

export const IME_LOGGER_META_STORAGE_KEY = "siheom:ime-logger-meta";

export function readImeLoggerMeta(): ImeLoggerMetaFields | null {
  try {
    const raw = localStorage.getItem(IME_LOGGER_META_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<ImeLoggerMetaFields>;
    if (
      typeof parsed.os !== "string" ||
      typeof parsed.browser !== "string" ||
      typeof parsed.ime !== "string"
    ) {
      return null;
    }

    return {
      os: parsed.os,
      browser: parsed.browser,
      ime: parsed.ime,
    };
  } catch {
    return null;
  }
}

export function writeImeLoggerMeta(meta: ImeLoggerMetaFields): void {
  localStorage.setItem(IME_LOGGER_META_STORAGE_KEY, JSON.stringify(meta));
}

export function resolveImeLoggerMeta(): ImeLoggerMetaFields {
  return readImeLoggerMeta() ?? detectImeLoggerMeta();
}
