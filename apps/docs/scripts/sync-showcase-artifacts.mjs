/**
 * Copies a11y snapshots from react-example into apps/docs/_snaps
 * and rewrites example markdown UI sections to import them via VitePress `<<<`.
 *
 * Run: yarn workspace @siheom/docs sync-showcase
 * Or:  yarn node apps/docs/scripts/sync-showcase-artifacts.mjs
 */
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const docsRoot = resolve(import.meta.dirname, "..");
const repoRoot = resolve(docsRoot, "../..");
const snapsOut = resolve(docsRoot, "_snaps");

/** @type {{ slug: string, snaps: { name: string, src: string }[], koHeading?: string, enHeading?: string }[]} */
const examples = [
	{
		slug: "counter",
		snaps: [
			{
				name: "counter-initial.snap",
				src: "apps/react-example/test/stories/__snapshots__/counter-initial.snap",
			},
			{
				name: "counter-after-clicks.snap",
				src: "apps/react-example/test/stories/__snapshots__/counter-after-clicks.snap",
			},
		],
	},
	{
		slug: "signup-form",
		snaps: [
			{
				name: "signup-form-initial.snap",
				src: "apps/react-example/test/stories/__snapshots__/signup-form-initial.snap",
			},
			{
				name: "signup-form-filled.snap",
				src: "apps/react-example/test/stories/__snapshots__/signup-form-filled.snap",
			},
			{
				name: "signup-form-with-errors.snap",
				src: "apps/react-example/test/stories/__snapshots__/signup-form-with-errors.snap",
			},
		],
	},
	{
		slug: "countdown",
		snaps: [
			{
				name: "countdown-initial.snap",
				src: "apps/react-example/test/stories/countdown/__snapshots__/countdown-initial.snap",
			},
		],
		koHeading: "UI 접근성",
		enHeading: "UI accessibility",
	},
	{
		slug: "settings",
		snaps: [
			{
				name: "settings-initial.snap",
				src: "apps/react-example/test/stories/shadcn/settings/__snapshots__/settings-initial.snap",
			},
		],
	},
	{
		slug: "document-actions",
		snaps: [
			{
				name: "document-actions-initial.snap",
				src: "apps/react-example/test/stories/shadcn/document-actions/__snapshots__/document-actions-initial.snap",
			},
		],
	},
	{
		slug: "command-menu",
		snaps: [
			{
				name: "command-menu-initial.snap",
				src: "apps/react-example/test/stories/shadcn/command-menu/__snapshots__/command-menu-initial.snap",
			},
		],
	},
	{
		slug: "team-invite",
		snaps: [
			{
				name: "team-invite-initial.snap",
				src: "apps/react-example/test/stories/shadcn/team-invite/__snapshots__/team-invite-initial.snap",
			},
		],
	},
	{
		slug: "notice-search",
		snaps: [
			{
				name: "notice-search-initial.snap",
				src: "apps/react-example/test/stories/shadcn/notice-search/__snapshots__/notice-search-initial.snap",
			},
		],
	},
	{
		slug: "view-switcher",
		snaps: [
			{
				name: "view-switcher-initial.snap",
				src: "apps/react-example/test/stories/shadcn/view-switcher/__snapshots__/view-switcher-initial.snap",
			},
		],
	},
	{
		slug: "task-table",
		snaps: [
			{
				name: "task-table-initial.snap",
				src: "apps/react-example/test/stories/shadcn/task-table/__snapshots__/task-table-initial.snap",
			},
		],
	},
	{
		slug: "order-tracking",
		snaps: [
			{
				name: "order-tracking-initial.snap",
				src: "apps/react-example/test/stories/shadcn/order-tracking/__snapshots__/order-tracking-initial.snap",
			},
		],
	},
	{
		slug: "meeting-booking",
		snaps: [
			{
				name: "meeting-booking-initial.snap",
				src: "apps/react-example/test/stories/shadcn/meeting-booking/__snapshots__/meeting-booking-initial.snap",
			},
		],
	},
	{
		slug: "save-feedback",
		snaps: [
			{
				name: "save-feedback-initial.snap",
				src: "apps/react-example/test/stories/shadcn/save-feedback/__snapshots__/save-feedback-initial.snap",
			},
		],
	},
	{
		slug: "mobile-filter",
		snaps: [
			{
				name: "mobile-filter-initial.snap",
				src: "apps/react-example/test/stories/shadcn/mobile-filter/__snapshots__/mobile-filter-initial.snap",
			},
		],
	},
	{
		slug: "billing-alert",
		snaps: [
			{
				name: "billing-alert-initial.snap",
				src: "apps/react-example/test/stories/shadcn/billing-alert/__snapshots__/billing-alert-initial.snap",
			},
		],
	},
	{
		slug: "profile-avatar",
		snaps: [
			{
				name: "profile-avatar-initial.snap",
				src: "apps/react-example/test/stories/shadcn/profile-avatar/__snapshots__/profile-avatar-initial.snap",
			},
		],
	},
	{
		slug: "two-factor",
		snaps: [
			{
				name: "two-factor-initial.snap",
				src: "apps/react-example/test/stories/shadcn/two-factor/__snapshots__/two-factor-initial.snap",
			},
		],
	},
	{
		slug: "app-shell",
		snaps: [
			{
				name: "app-shell-initial.snap",
				src: "apps/react-example/test/stories/shadcn/app-shell/__snapshots__/app-shell-initial.snap",
			},
		],
	},
	{
		slug: "kanban",
		snaps: [
			{
				name: "kanban-initial.snap",
				src: "apps/react-example/test/stories/shadcn/kanban/__snapshots__/kanban-initial.snap",
			},
		],
	},
	{
		slug: "chart-dashboard",
		snaps: [
			{
				name: "chart-dashboard-initial.snap",
				src: "apps/react-example/test/stories/shadcn/chart-dashboard/__snapshots__/chart-dashboard-initial.snap",
			},
		],
	},
	{
		slug: "llm-chat",
		snaps: [
			{
				name: "llm-chat-initial.snap",
				src: "apps/react-example/test/stories/shadcn/llm-chat/__snapshots__/llm-chat-initial.snap",
			},
		],
	},
];

mkdirSync(snapsOut, { recursive: true });

let copied = 0;
for (const example of examples) {
	for (const snap of example.snaps) {
		const from = resolve(repoRoot, snap.src);
		if (!existsSync(from)) {
			console.warn(`[sync-showcase] missing snap: ${snap.src}`);
			continue;
		}
		copyFileSync(from, join(snapsOut, snap.name));
		copied++;
	}
}
console.log(`[sync-showcase] copied ${copied} snaps → ${relative(repoRoot, snapsOut)}`);

/**
 * Replace the first ## UI… section (until next ##) with snap import(s).
 * Special-cases counter / signup-form which have extra snapshot sections.
 */
function uiSectionKo(snapNames, heading = "UI 접근성") {
	const imports = snapNames
		.map((name) => `<<< @/_snaps/${name}{text}`)
		.join("\n\n");
	if (snapNames.length === 1) {
		return `## ${heading}\n\n시험이 고정한 초기 접근성 스냅샷입니다.\n\n${imports}\n\n`;
	}
	return `## ${heading}\n\n${imports}\n\n`;
}

function uiSectionEn(snapNames, heading = "UI accessibility") {
	const imports = snapNames
		.map((name) => `<<< @/_snaps/${name}{text}`)
		.join("\n\n");
	if (snapNames.length === 1) {
		return `## ${heading}\n\nInitial accessibility snapshot fixed by the test.\n\n${imports}\n\n`;
	}
	return `## ${heading}\n\n${imports}\n\n`;
}

/** @param {string} md @param {string} replacement */
function replaceUiSection(md, replacement) {
	const re =
		/^## (?:UI(?:\s+[^\n]*)?|Accessibility surface)\n[\s\S]*?(?=^## )/m;
	if (!re.test(md)) {
		return null;
	}
	return md.replace(re, replacement);
}

function rewriteCounter(md, lang) {
	const initial =
		lang === "ko"
			? `<<< @/_snaps/counter-initial.snap{text}`
			: `<<< @/_snaps/counter-initial.snap{text}`;
	const after =
		lang === "ko"
			? `<<< @/_snaps/counter-after-clicks.snap{text}`
			: `<<< @/_snaps/counter-after-clicks.snap{text}`;

	let next = md;
	// Replace ## UI section (keep short intro if present — drop code sample, use snap)
	const uiRe = /^## UI\n[\s\S]*?(?=^## )/m;
	const uiBody =
		lang === "ko"
			? `## UI 접근성\n\n버튼 children이 accessible name입니다.\n\n초기:\n\n${initial}\n\n클릭 두 번 후:\n\n${after}\n\n`
			: `## UI accessibility\n\nThe button's children are its accessible name.\n\nInitial:\n\n${initial}\n\nAfter two clicks:\n\n${after}\n\n`;
	next = next.replace(uiRe, uiBody);

	// Remove duplicated inline snap text under "시험: 접근성 스냅샷" / "Test: accessibility snapshot"
	next = next.replace(
		/(## (?:시험: 접근성 스냅샷|Test: accessibility snapshot)\n[\s\S]*?```tsx\n[\s\S]*?```\n)\n[\s\S]*?(?=^## )/m,
		"$1\n",
	);
	return next;
}

function rewriteSignup(md, lang) {
	const p = "@/_snaps";
	const code = `\`\`\`tsx
return runSiheom(
  given.render(<SignUpForm signUpMember={noop} />),
  assertions.a11ySnapshot(query.form("회원가입"), "signup-form-initial.snap"),
);
\`\`\``;
	const errCode = `\`\`\`tsx
return runSiheom(
  given.render(<SignUpForm signUpMember={noop} />),
  actions.click(query.button("가입하기")),
  assertions.a11ySnapshot(query.form("회원가입"), "signup-form-with-errors.snap"),
);
\`\`\``;

	if (lang === "ko") {
		return md.replace(
			/^## UI\n[\s\S]*?(?=^## 다음 단계)/m,
			`## UI 접근성

\`query.form("회원가입")\` 기준 초기 스냅샷입니다.

<<< ${p}/signup-form-initial.snap{text}

## 시험: 검증 후 가입

빈 폼 제출 → 에러 assertion → 값 입력 → 가입:

\`\`\`tsx
await runSiheom(
  given.render(<SignUpForm signUpMember={handler} />),
  actions.click(query.button("가입하기")),
  assertions.errormessage(query.textbox(/이메일/), "올바른 이메일 형식이 아닙니다"),
  assertions.errormessage(query.textbox(/비밀번호/), "비밀번호를 10자 이상 입력해주세요"),
  assertions.errormessage(query.checkbox("약관 동의"), "약관 동의에 동의해야 합니다"),
  actions.fill(query.textbox(/이메일/), "test@test.com"),
  actions.fill(query.textbox(/비밀번호/), "test123456"),
  actions.click(query.checkbox("약관 동의")),
  actions.click(query.checkbox("개인정보 수집 동의")),
  actions.click(query.button("가입하기")),
);
\`\`\`

\`errormessage\`는 \`toHaveAccessibleErrorMessage\`와 동일한 정보를 assertion 스텝으로 씁니다.

## 접근성 스냅샷: 초기 상태

${code}

<<< ${p}/signup-form-initial.snap{text}

## 접근성 스냅샷: 에러 상태

제출 후 invalid·alert 노드가 스냅샷에 나타납니다.

${errCode}

<<< ${p}/signup-form-with-errors.snap{text}

## 접근성 포인트

- **레이블**: \`query.textbox(/이메일/)\`은 accessible name에 \`*\`가 포함될 수 있습니다. 정규식으로 유연하게 매칭합니다.
- **에러 연결**: invalid 필드는 \`[invalid=true]\`와 \`alert\` 자식으로 스냅샷에 드러납니다.
- **form**: \`aria-labelledby\`로 이름 붙은 \`form\`을 스냅샷 루트로 쓰면 범위가 명확합니다.

`,
		);
	}

	return md.replace(
		/^## UI(?: accessibility)?\n[\s\S]*?(?=^## Next steps)/m,
		`## UI accessibility

Initial snapshot scoped to \`query.form("회원가입")\`.

<<< ${p}/signup-form-initial.snap{text}

## Test: validate then sign up

Submit empty → error assertions → fill → submit:

\`\`\`tsx
await runSiheom(
  given.render(<SignUpForm signUpMember={handler} />),
  actions.click(query.button("가입하기")),
  assertions.errormessage(query.textbox(/이메일/), "올바른 이메일 형식이 아닙니다"),
  assertions.errormessage(query.textbox(/비밀번호/), "비밀번호를 10자 이상 입력해주세요"),
  assertions.errormessage(query.checkbox("약관 동의"), "약관 동의에 동의해야 합니다"),
  actions.fill(query.textbox(/이메일/), "test@test.com"),
  actions.fill(query.textbox(/비밀번호/), "test123456"),
  actions.click(query.checkbox("약관 동의")),
  actions.click(query.checkbox("개인정보 수집 동의")),
  actions.click(query.button("가입하기")),
);
\`\`\`

\`errormessage\` mirrors \`toHaveAccessibleErrorMessage\` as an assertion step.

## Snapshot: initial

${code}

<<< ${p}/signup-form-initial.snap{text}

## Snapshot: errors

After submit, invalid fields and \`alert\` nodes appear in the tree:

${errCode}

<<< ${p}/signup-form-with-errors.snap{text}

## Accessibility notes

- **Labels**: \`query.textbox(/이메일/)\` matches accessible names that include \`*\`. Use RegExp when labels vary.
- **Error wiring**: Invalid fields show \`[invalid=true]\` and \`alert\` children in snapshots.
- **form**: A named \`form\` (\`aria-labelledby\`) makes a clear snapshot root.

`,
	);
}

for (const example of examples) {
	const snapNames = example.snaps.map((s) => s.name);
	const primary = snapNames[0];
	const koPath = join(docsRoot, "examples", `${example.slug}.md`);
	const enPath = join(docsRoot, "en/examples", `${example.slug}.md`);

	for (const [lang, path] of [
		["ko", koPath],
		["en", enPath],
	]) {
		if (!existsSync(path)) {
			console.warn(`[sync-showcase] missing md: ${relative(repoRoot, path)}`);
			continue;
		}
		const md = readFileSync(path, "utf8");
		// Already wired to VitePress snippet import — only refresh snap files above.
		if (md.includes(`_snaps/${primary}`)) {
			continue;
		}

		let next;
		if (example.slug === "counter") {
			next = rewriteCounter(md, lang);
		} else if (example.slug === "signup-form") {
			next = rewriteSignup(md, lang);
		} else {
			const heading =
				lang === "ko"
					? (example.koHeading ?? "UI 접근성")
					: (example.enHeading ?? "UI accessibility");
			const section =
				lang === "ko"
					? uiSectionKo(snapNames, heading)
					: uiSectionEn(snapNames, heading);
			next = replaceUiSection(md, section);
			if (!next) {
				console.warn(
					`[sync-showcase] no ## UI section in ${relative(repoRoot, path)}`,
				);
				continue;
			}
		}
		if (next !== md) {
			writeFileSync(path, next);
			console.log(`[sync-showcase] updated ${relative(repoRoot, path)}`);
		}
	}
}

console.log("[sync-showcase] done");
