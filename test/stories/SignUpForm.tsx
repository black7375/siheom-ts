import { useId, useState } from "react";
import * as v from "valibot";

const newMemberSchema = v.object({
	email: v.pipe(
		v.string(),
		v.email("올바른 이메일 형식이 아닙니다"),
	),
	password: v.pipe(
		v.string(),
		v.minLength(10, "비밀번호를 10자 이상 입력해주세요"),
	),
});

type NewMember = v.InferOutput<typeof newMemberSchema>;

export function SignUpForm({
	signUpMember,
}: { signUpMember: (newMember: NewMember) => Promise<void> }) {
	const [error, setError] = useState({
		email: undefined,
		password: undefined,
	} as { email: string | undefined; password: string | undefined });
	const inputId = useId();
	const errorId = useId();
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);

				const result = v.safeParse(newMemberSchema, {
					email: data.get("email"),
					password: data.get("password"),
				});

				if (result.success) {
					signUpMember(result.output);
					return;
				}

				setError(
					Object.fromEntries(
						result.issues.map((issue) => [issue.path?.map(item => item.key).join("."), issue.message]),
					),
				);
			}}
		>
			<label>
				이메일
				<input
					type="email"
					name="email"
					aria-invalid={error.email ? "true" : undefined}
					aria-describedby={error.email ? "error-email" : ""}
					aria-errormessage={error.email ? "error-email" : ""}
				/>
			</label>
			{error.email && (
				<div
					id={"error-email"}
					role="alert"
					aria-live="assertive"
					aria-label={error.email}
				>
					{error.email}
				</div>
			)}

			<label htmlFor={inputId}>비밀번호</label>
			<input
				id={inputId}
				// biome-ignore lint/a11y/noRedundantRoles: password input is not textbox role default
				role="textbox"
				type="password"
				name="password"
				aria-invalid={error.password ? "true" : undefined}
				aria-describedby={error.password ? errorId : ""}
				aria-errormessage={error.password ? errorId : ""}
			/>
			{error.password && (
				<div
					id={errorId}
					role="alert"
					aria-live="assertive"
					aria-label={error.password}
				>
					{error.password}
				</div>
			)}

			<button type="submit">가입하기</button>
		</form>
	);
}
