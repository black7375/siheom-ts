import { Button } from "@/components/ui/button";
import { SimpleForm, SimpleTextInput, SimpleCheckbox } from "@/components/simple-form/SimpleForm";
import type React from "react";
import * as v from "valibot";
import { FieldGroup } from "@/components/ui/field";

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
