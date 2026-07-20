import { defineConfig } from "vitepress";

const GETTING_STARTED = {
	text: "시작하기",
	items: [
		{ text: "설치", link: "/getting-started/install" },
		{ text: "React 빠른 시작", link: "/getting-started/react" },
		{ text: "Vue 빠른 시작", link: "/getting-started/vue" },
		{ text: "Svelte 빠른 시작", link: "/getting-started/svelte" },
		{ text: "Angular 빠른 시작", link: "/getting-started/angular" },
		{ text: "Qwik 빠른 시작", link: "/getting-started/qwik" },
		{ text: "React Native 빠른 시작", link: "/getting-started/react-native" },
	],
};

const GUIDES = {
	text: "가이드",
	items: [
		{ text: "헤드리스 UI 컴포넌트", link: "/guides/headless-components" },
	],
};

const CONCEPTS = {
	text: "개념",
	items: [
		{ text: "개요", link: "/concepts" },
		{ text: "given", link: "/concepts/given" },
		{ text: "action", link: "/concepts/actions" },
		{ text: "assertion", link: "/concepts/assertions" },
		{ text: "effect · withFakeTimers", link: "/concepts/effects" },
		{ text: "locator", link: "/concepts/locator" },
		{ text: "접근성 스냅샷", link: "/concepts/a11y-snapshot" },
		{ text: "Factory", link: "/concepts/factory" },
	],
};

const CONFIGURATION = {
	text: "설정과 API",
	items: [
		{ text: "API 개요", link: "/configuration" },
		{ text: "given", link: "/configuration/given" },
		{ text: "actions", link: "/configuration/actions" },
		{ text: "assertions", link: "/configuration/assertions" },
		{ text: "effect", link: "/configuration/effects" },
		{ text: "메시지 맵", link: "/configuration/messages" },
	],
};

const EXAMPLES = {
	text: "예제",
	items: [
		{ text: "개요", link: "/examples" },
		{ text: "Counter", link: "/examples/counter" },
		{ text: "SignUpForm", link: "/examples/signup-form" },
		{ text: "라우팅 / 링크", link: "/examples/routing" },
		{ text: "Countdown", link: "/examples/countdown" },
	],
};

const sidebarKo = [
	{ text: "siheom이란", link: "/intro" },
	GETTING_STARTED,
	CONCEPTS,
	GUIDES,
	{ text: "비교", link: "/comparisons" },
	CONFIGURATION,
	EXAMPLES,
	{ text: "AI 에이전트", link: "/ai-agent" },
];

const GETTING_STARTED_EN = {
	text: "Getting started",
	items: [
		{ text: "Installation", link: "/en/getting-started/install" },
		{ text: "React quick start", link: "/en/getting-started/react" },
		{ text: "Vue quick start", link: "/en/getting-started/vue" },
		{ text: "Svelte quick start", link: "/en/getting-started/svelte" },
		{ text: "Angular quick start", link: "/en/getting-started/angular" },
		{ text: "Qwik quick start", link: "/en/getting-started/qwik" },
		{ text: "React Native quick start", link: "/en/getting-started/react-native" },
	],
};

const GUIDES_EN = {
	text: "Guides",
	items: [
		{ text: "Headless UI components", link: "/en/guides/headless-components" },
	],
};

const CONCEPTS_EN = {
	text: "Concepts",
	items: [
		{ text: "Overview", link: "/en/concepts" },
		{ text: "given", link: "/en/concepts/given" },
		{ text: "actions", link: "/en/concepts/actions" },
		{ text: "assertions", link: "/en/concepts/assertions" },
		{ text: "effect · withFakeTimers", link: "/en/concepts/effects" },
		{ text: "locator", link: "/en/concepts/locator" },
		{ text: "Accessibility snapshot", link: "/en/concepts/a11y-snapshot" },
		{ text: "Factory", link: "/en/concepts/factory" },
	],
};

const CONFIGURATION_EN = {
	text: "Configuration",
	items: [
		{ text: "API overview", link: "/en/configuration" },
		{ text: "given", link: "/en/configuration/given" },
		{ text: "actions", link: "/en/configuration/actions" },
		{ text: "assertions", link: "/en/configuration/assertions" },
		{ text: "effect", link: "/en/configuration/effects" },
		{ text: "Message map", link: "/en/configuration/messages" },
	],
};

const EXAMPLES_EN = {
	text: "Examples",
	items: [
		{ text: "Overview", link: "/en/examples" },
		{ text: "Counter", link: "/en/examples/counter" },
		{ text: "SignUpForm", link: "/en/examples/signup-form" },
		{ text: "Routing / links", link: "/en/examples/routing" },
		{ text: "Countdown", link: "/en/examples/countdown" },
	],
};

const sidebarEn = [
	{ text: "What is siheom?", link: "/en/intro" },
	GETTING_STARTED_EN,
	CONCEPTS_EN,
	GUIDES_EN,
	{ text: "Comparisons", link: "/en/comparisons" },
	CONFIGURATION_EN,
	EXAMPLES_EN,
	{ text: "AI agents", link: "/en/ai-agent" },
];

export default defineConfig({
	cleanUrls: true,
	locales: {
		root: {
			label: "한국어",
			lang: "ko-KR",
			title: "siheom",
			description:
				"접근성 role과 name을 중심에 둔, 데이터 기반 프론트엔드 테스트 인터프리터",
			themeConfig: {
				logo: "/logo.svg",
				nav: [
					{ text: "홈", link: "/" },
					{ text: "siheom이란", link: "/intro" },
					GETTING_STARTED,
					CONCEPTS,
					CONFIGURATION,
				],
				sidebar: sidebarKo,
				socialLinks: [
					{
						icon: "github",
						link: "https://github.com/twinstae/siheom-ts",
					},
				],
				search: { provider: "local" },
				editLink: {
					pattern:
						"https://github.com/twinstae/siheom-ts/edit/main/apps/docs/:path",
				},
				footer: {
					message: "Released under the MIT License.",
				},
			},
		},
		en: {
			label: "English",
			lang: "en-US",
			link: "/en/",
			title: "siheom",
			description:
				"Data-first frontend test interpreter centered on accessibility roles and names",
			themeConfig: {
				logo: "/logo.svg",
				nav: [
					{ text: "Home", link: "/en/" },
					{ text: "What is siheom?", link: "/en/intro" },
					GETTING_STARTED_EN,
					CONCEPTS_EN,
					CONFIGURATION_EN,
				],
				sidebar: sidebarEn,
				socialLinks: [
					{
						icon: "github",
						link: "https://github.com/twinstae/siheom-ts",
					},
				],
				search: { provider: "local" },
				editLink: {
					pattern:
						"https://github.com/twinstae/siheom-ts/edit/main/apps/docs/:path",
				},
				footer: {
					message: "Released under the MIT License.",
				},
			},
		},
	},
});
