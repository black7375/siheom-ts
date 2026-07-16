import { parseFormDatatoJsObject } from "@/utils/parseFormDatatoJsObject";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { createContext, useState, useContext, useId } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import * as v from "valibot";

const ErrorContext = createContext<Record<string, string | undefined>>({});

export function SimpleForm<T extends object>({
  schema,
  children,
  onSubmit,
  ...formProps
}: {
  schema: v.BaseSchema<T, T, v.BaseIssue<unknown>>;
  children: React.ReactNode;
  onSubmit: (data: T) => Promise<void>;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "children">) {
  const [error, setError] = useState({} as Record<string, string | undefined>);

  return (
    <ErrorContext.Provider value={error}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          const formData = new FormData(event.currentTarget);
          const rawData = parseFormDatatoJsObject(formData, schema);
          const result = v.safeParse(schema, rawData);

          if (result.success === false) {
            const errors = Object.fromEntries(
              result.issues.map((issue) => [
                issue.path?.map((item) => item?.key).join("."),
                issue.message,
              ]),
            );

            setError(errors);
            return;
          }

          setError({});
          return onSubmit(result.output);
        }}
        {...formProps}
      >
        {children}
      </form>
    </ErrorContext.Provider>
  );
}

export function SimpleTextInput({
  name,
  type,
  label,
}: {
  name: string;
  type: "text" | "email" | "password";
  label: string;
}) {
  const error = useContext(ErrorContext);
  const errorId = useId();

  return (
    <Field data-invalid={error[name] ? true : undefined}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        type={type}
        aria-invalid={error[name] ? true : undefined}
        aria-errormessage={error[name] ? errorId : undefined}
      />
      {error[name] ? <FieldError id={errorId}>{error[name]}</FieldError> : null}
    </Field>
  );
}

export function SimpleCheckbox({ name, label }: { name: string; label: string }) {
  const error = useContext(ErrorContext);
  const errorId = useId();
  const [checked, setChecked] = useState(false);

  return (
    <Field orientation="horizontal" data-invalid={error[name] ? true : undefined}>
      <Checkbox
        id={name}
        checked={checked}
        onCheckedChange={setChecked}
        aria-invalid={error[name] ? true : undefined}
        aria-errormessage={error[name] ? errorId : undefined}
      />
      <FieldContent>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        {error[name] ? <FieldError id={errorId}>{error[name]}</FieldError> : null}
      </FieldContent>
      <input type="hidden" name={name} value={checked ? "on" : "off"} />
    </Field>
  );
}
