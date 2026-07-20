export type ComposedEventRecord = {
  type: string;
  key: string | null;
  code: string | null;
  keyCode: number | null;
  isComposing: boolean | null;
  inputType: string | null;
  data: string | null;
  value: string;
};
