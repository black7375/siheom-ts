# assertion

assertion 스텝은 **기대 상태**를 데이터로 표현합니다. 실패하면 실행 로그와 접근성 스냅샷이 붙은 [구조화된 리포트](/getting-started/react)를 받습니다.

## 자주 쓰는 assertion

| API | 설명 |
| --- | --- |
| `assertions.visible(target)` | 요소가 보이는지 |
| `assertions.checked(target)` | 체크됨 |
| `assertions.errormessage(target, text)` | 접근 가능한 에러 메시지 |
| `assertions.a11ySnapshot(target, path)` | 접근성 트리 파일 스냅샷 |
| `assertions.tableSnapshot(target, path)` | 테이블 마크다운 스냅샷 |

부정 assertion은 `assertions.not.*`로 씁니다 (`not.visible`, `not.checked`, …).

```tsx
assertions.visible(query.button("2"))
assertions.errormessage(query.textbox(/이메일/), "올바른 이메일 형식이 아닙니다")
assertions.a11ySnapshot(query.region("signup-form"), "signup-form-initial.snap")
```

## 접근성 스냅샷

`a11ySnapshot`은 HTML이 아니라 **시맨틱 접근성 트리**를 파일과 비교합니다. [접근성 스냅샷](/concepts/a11y-snapshot) 페이지를 참고하세요.

## 커스텀 assertion

[Factory](/concepts/factory)의 `extendSiheom`으로 assertion 레지스트리에 추가합니다.

## 다음 단계

- [assertions API](/configuration/assertions) — 전체 목록
- [예제: SignUpForm](/examples/signup-form) — errormessage와 스냅샷
- [메시지 맵](/configuration/messages) — 실패 리포트 헤더
