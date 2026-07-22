import * as v from "valibot";

type FieldType = "string" | "number" | "boolean" | "unknown";

function getObjectSchemaEntries(schema: unknown): Record<string, unknown> | null {
  if (
    schema &&
    typeof schema === "object" &&
    "type" in schema &&
    (schema as { type: string }).type === "object"
  ) {
    const entries = (schema as { entries?: Record<string, unknown> }).entries;
    if (entries && typeof entries === "object") {
      return entries;
    }
  }
  return null;
}

function inferFieldType(fieldSchema: unknown): FieldType {
  if (!fieldSchema || typeof fieldSchema !== "object" || !("type" in fieldSchema)) {
    return "unknown";
  }

  const schema = fieldSchema as { type: string; pipe?: unknown[] };
  const typeSource =
    schema.type === "pipe" && Array.isArray(schema.pipe) && schema.pipe.length > 0
      ? (schema.pipe[0] as { type?: string })
      : schema;

  if (
    typeSource.type === "string" ||
    typeSource.type === "email" ||
    typeSource.type === "password"
  ) {
    return "string";
  }
  if (typeSource.type === "number" || typeSource.type === "integer") {
    return "number";
  }
  if (typeSource.type === "boolean" || typeSource.type === "literal") {
    return "boolean";
  }
  return "unknown";
}

function formDataEntryToString(value: FormDataEntryValue): string {
  return typeof value === "string" ? value : value.name;
}

function convertFormValue(value: FormDataEntryValue | null, targetType: FieldType): unknown {
  if (value === null || value === undefined) {
    return undefined;
  }

  const text = formDataEntryToString(value);

  if (targetType === "number") {
    const num = Number(text);
    return Number.isNaN(num) ? text : num;
  }

  if (targetType === "boolean") {
    if (text === "on") return true;
    if (text === "off") return false;
    const lowerValue = text.toLowerCase();
    if (["true", "1", "yes"].includes(lowerValue)) return true;
    if (["false", "0", "no", ""].includes(lowerValue)) return false;
    return Boolean(text);
  }

  return text;
}

export function parseFormDatatoJsObject<T extends object>(
  formData: FormData,
  schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>,
): unknown {
  const entries = getObjectSchemaEntries(schema);
  const fieldKeys = entries ? Object.keys(entries) : [];
  const keysToProcess = fieldKeys.length > 0 ? fieldKeys : [...formData.keys()];

  return Object.fromEntries(
    keysToProcess.map((key) => {
      const value = formData.get(key);
      const fieldSchema = entries?.[key];
      return [key, convertFormValue(value, inferFieldType(fieldSchema))];
    }),
  );
}
