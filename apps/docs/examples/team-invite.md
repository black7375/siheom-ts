# Team Invite — Select + Combobox

역할은 Select로, 팀원은 검색 가능한 Combobox로 고른 뒤 초대하는 폼입니다. Select와 Combobox 모두 "값을 고르면 트리거/입력에 반영된다"는 패턴은 같지만, 여는 방법과 필터링 여부가 다릅니다.

소스: `apps/react-example/test/stories/shadcn/team-invite/TeamInviteForm.tsx`, `TeamInviteForm.test.tsx`.

## UI

- 역할 Select: `label` `"역할"`이 트리거를 가리킴; 옵션은 `option` (`"멤버"`, `"관리자"`)
- 팀원 Combobox: role `combobox`, name `"팀원"`; 옵션은 `option` (예: `"김태희"`)
- 제출: `button` `"초대하기"`
- 결과: role `status`, name `"초대 결과"`

## 시험: 역할과 팀원을 골라 초대

```tsx
let result: unknown = null;

await runSiheom(
  given.render(
    <TeamInviteForm onInvite={async (invite) => { result = invite; }} />,
  ),
  actions.click(query.label("역할")),
  actions.click(query.option("멤버")),
  actions.fill(query.combobox("팀원"), "김"),
  actions.click(query.option("김태희")),
  actions.click(query.button("초대하기")),
  assertions.textContent(query.status("초대 결과"), "김태희를 멤버로 초대했습니다"),
);

expect(result).toEqual({ member: "김태희", role: "member" });
```

`query.label("역할")`을 클릭하는 것은 실제 브라우저에서 `<label>`을 클릭했을 때와 같습니다 — `htmlFor`로 연결된 Select 트리거가 열립니다. Combobox는 입력에 `actions.fill`로 검색어를 채우면 옵션 목록이 좁혀지고, 그중 하나를 `actions.click`으로 고릅니다.

`onInvite` 콜백에 넘어온 실제 값을 `expect`로 검증해, UI에 보이는 텍스트(`"김태희를 멤버로 초대했습니다"`)와 애플리케이션 로직에 전달된 데이터(`{ member: "김태희", role: "member" }`)가 일치하는지 함께 확인합니다.

## 접근성 포인트

- Select 트리거는 `SelectValue`의 placeholder로 시작하지만, `label`의 `htmlFor`가 실제 accessible name의 원천입니다. `query.label`로 라벨을 찾아 클릭하는 편이 트리거의 내부 구조 변경에 덜 취약합니다.
- Combobox는 `aria-label="팀원"`을 입력에 직접 달아, `role=combobox`와 name을 한 번에 얻습니다.

## 다음 단계

- [notice-search](/examples/notice-search) — 검색과 Empty 상태
- [locator](/concepts/locator) — role + name으로 쿼리 만들기
- [actions API](/configuration/actions) — fill · click
