# React Native 빠른 시작

React Native Testing Library로 첫 시험을 작성하고, 실패 리포트를 읽고, provider로 컴포넌트를 감싸는 방법까지 이 페이지에서 다룹니다.

이 페이지에서 배우는 것:

- vitest-native로 시험을 실행하는 방법
- 첫 시험을 작성하는 방법
- 액션과 assertion 스텝을 쓰는 방법
- 시험이 실패했을 때 리포트를 읽는 방법
- provider로 컴포넌트를 감싸는 방법

## 설정

React Native는 브라우저에서 렌더할 수 없으므로, siheom은 [vitest-native](https://github.com/nomadev/vitest-native)의 순수 JS 엔진 위에서 React Native Testing Library로 컴포넌트를 렌더합니다.

필요한 dev dependency:

```bash
bun add -d vitest vitest-native @testing-library/react-native test-renderer
bun add @siheom/react-native react react-native @testing-library/jest-dom
```

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { reactNative } from "vitest-native";

export default defineConfig({
  // engine: "mock"은 라이브러리 단위 테스트용 순수 JS RN입니다.
  // 앱에서 완전한 RN/babel 세팅이 필요하면 engine: "native"를 씁니다.
  plugins: [reactNative({ engine: "mock" })],
  test: {
    globals: true,
    include: ["test/**/*.test.tsx"],
  },
});
```

실행:

```bash
bunx vitest
```

## 첫 시험

`runSiheom`에 스텝을 순서대로 넘깁니다. 시험 본문에는 `await`를 쓰지 않고, `return runSiheom(...)`으로 인터프리터에 실행을 맡깁니다.

```tsx
import { useState } from "react";
import { Pressable, Text } from "react-native";
import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react-native";

function Counter() {
  const [value, setValue] = useState(0);
  return (
    <Pressable accessibilityRole="button" onPress={() => setValue((v) => v + 1)}>
      <Text>{String(value)}</Text>
    </Pressable>
  );
}

describe("Counter", () => {
  it("값을 증가시킬 수 있다", () => {
    return runSiheom(
      given.render(<Counter />),
      actions.click(query.button("0")),
      actions.click(query.button("1")),
      assertions.visible(query.button("2")),
    );
  });
});
```

- `given.render`가 Counter를 React Native Testing Library의 `render`로 마운트합니다.
- `actions.click`이 현재 값을 표시하는 버튼을 두 번 누릅니다.
- `assertions.visible`이 값 `2`인 버튼이 보이는지 확인합니다.
- `query.button("0")`은 `accessibilityRole`/`role` `button`과 접근성 이름 `"0"`으로 요소를 찾습니다.

같은 파일에 시험이 여러 개 있으면, 렌더 트리를 정리하도록 `afterEach`에 `cleanupReactRoots`를 연결하세요.

```ts
import { afterEach } from "vitest";
import { cleanupReactRoots } from "@siheom/react-native";

afterEach(cleanupReactRoots);
```

## 실패하면 어떻게 보이나

잘못된 assertion으로 실패하면, siheom은 실행 로그·원본 에러·접근성 스냅샷을 한 `Error` 메시지에 담습니다. 접근성 스냅샷은 `accessibilityRole`/`accessibilityLabel`/`accessibilityState`를 기준으로 만들어집니다.

```tsx
return runSiheom(
  given.render(<Counter />),
  actions.click(query.button("0")),
  actions.click(query.button("1")),
  // 실제 값은 2인데 3을 기대하면 실패합니다
  assertions.visible(query.button("3")),
);
```

실패 시 리포트 예시:

```text
[Logs]

click!      : button "0"
click!      : button "1"

[Original Error Message]

Unable to find an accessible element with the role "button" and name "3"

[A11y Snapshot]

button "2"
```

어느 스텝까지 성공했는지(`[Logs]`), 무엇이 기대와 달랐는지(`[Original Error Message]`), 화면에 무엇이 있는지(`[A11y Snapshot]`)를 한곳에서 볼 수 있습니다.

## provider로 감싸기

Navigation container나 context provider가 필요하면 `given.render`를 확장합니다.

```tsx
import { extendSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { render } from "@testing-library/react-native";
import { Providers } from "./Providers";

const { runSiheom, given, actions, assertions, query } = extendSiheom(
  {
    actions: defaultActions,
    assertions: defaultAssertions,
    givens: {
      render: async (element) => {
        await render(<Providers>{element}</Providers>);
      },
    },
  },
  {},
);
```

이 바인딩을 테스트 헬퍼 모듈로 export해 suite 전체에서 재사용합니다. 자세한 내용은 [given](/concepts/given)을 참고하세요.

## 다음 단계

- [개념 개요](/concepts) — given / action / assert와 locator
- [actions API](/configuration/actions) — click, fill, type 등
- [assertions API](/configuration/assertions) — visible, a11ySnapshot 등
- [비교](/comparisons) — Testing Library·Playwright와의 관계
