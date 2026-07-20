# Headless component compatibility

Siheom specs for the same subscribe-dialog scenario across headless UI libraries.

## Scenario

1. Click **구독하기** → subscription dialog opens
2. Fill **이름**, **이메일**
3. Pick one **구독할 항목** from Select
4. Check **약관에 동의합니다**
5. Submit **구독하기** → dialog closes

## Libraries

- [x] React Aria (`ReactAria.tsx`)
- [ ] Radix UI (`Radix.tsx`)
- [ ] Ariakit (`Ariakit.tsx`)
- [ ] Material UI (`Mui.tsx`)
- [ ] Ark UI (`ArkUi.tsx`)

Each library: `test/components/<library>/`, `test/stories/<Name>.tsx`, `.test.tsx`, `.stories.tsx`.
