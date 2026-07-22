/** Read a text field from FormData without stringifying File entries. */
export function formDataText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}
