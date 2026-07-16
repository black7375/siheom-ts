import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseFormDatatoJsObject } from "@test/utils/parseFormDatatoJsObject";
import { createContext, useContext, useId, useState } from "react";
import type React from "react";
import * as v from "valibot";

const newMemberSchema = v.object({
  email: v.pipe(v.string(), v.email("올바른 이메일 형식이 아닙니다")),
  password: v.pipe(v.string(), v.minLength(10, "비밀번호를 10자 이상 입력해주세요")),
  agreement: v.literal(true, "약관 동의에 동의해야 합니다"),
  privacy: v.literal(true, "개인정보 수집 동의에 동의해야 합니다"),
});

type NewMember = v.InferOutput<typeof newMemberSchema>;

export function SignUpForm({
  signUpMember,
}: {
  signUpMember: (newMember: NewMember) => Promise<void>;
}) {
  return (
    <section>
      <h2 id="signup-form-title">회원가입</h2>
      <SimpleForm
        id="signup-form"
        aria-labelledby="signup-form-title"
        className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm"
        schema={newMemberSchema}
        onSubmit={signUpMember}
      >
        <FieldGroup>
          <SimpleTextInput name="email" type="email" label="이메일" />
          <SimpleTextInput name="password" type="password" label="비밀번호" />
          <SimpleCheckbox name="agreement" label="약관 동의" />
          <SimpleCheckbox name="privacy" label="개인정보 수집 동의" />
        </FieldGroup>

        <Button type="submit">가입하기</Button>
      </SimpleForm>
    </section>
  );
}

const ErrorContext = createContext<Record<string, string | undefined>>({});

function SimpleForm<T extends object>({
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

function SimpleTextInput({
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

function SimpleCheckbox({ name, label }: { name: string; label: string }) {
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
