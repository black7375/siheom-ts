# Team Invite — Select + Combobox

A form that picks a role via Select and a team member via a searchable Combobox before submitting an invite. Both follow "pick a value, it shows up in the trigger/input," but differ in how they open and whether they filter.

Source: `apps/react-example/test/stories/shadcn/team-invite/TeamInviteForm.tsx`, `TeamInviteForm.test.tsx`.

## UI

- Role Select: `label` `"역할"` points at the trigger; options are `option` (`"멤버"`, `"관리자"`)
- Member Combobox: role `combobox`, name `"팀원"`; options are `option` (e.g. `"김태희"`)
- Submit: `button` `"초대하기"`
- Result: role `status`, name `"초대 결과"`

## Test: pick a role and member, then invite

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

Clicking `query.label("역할")` behaves like clicking a real `<label>` in the browser — it opens the Select trigger linked via `htmlFor`. The combobox narrows its option list as `actions.fill` types a search term into it, then one option is picked with `actions.click`.

Asserting on the actual value passed to the `onInvite` callback checks that the visible text (`"김태희를 멤버로 초대했습니다"`) and the data handed to application logic (`{ member: "김태희", role: "member" }`) agree.

## Accessibility notes

- The Select trigger starts out showing `SelectValue`'s placeholder, but the accessible name really comes from the `label`'s `htmlFor` link. Finding the label with `query.label` and clicking it is less brittle than depending on the trigger's internal structure.
- The combobox attaches `aria-label="팀원"` directly to the input, getting `role=combobox` and its name from one place.

## Next steps

- [notice-search](/en/examples/notice-search) — Search and empty state
- [locator](/en/concepts/locator) — Building queries from role + name
- [actions API](/en/configuration/actions) — fill · click
