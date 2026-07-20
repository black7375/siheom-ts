# @siheom/react-native — coverage behaviors

RNTL-backed runtime. Target: exercise public APIs through `runSiheom`.

## Runner

- [x] Counter press increments visible button label
- [x] Failed assertion includes RN a11y snapshot section

## Actions

- [x] `click` maps to `userEvent.press`
- [x] `fill` clears then types into a labeled TextInput
- [x] `type` appends into a TextInput
- [x] `{Enter}` in fill/type fires `submitEditing`

## Assertions

- [x] `visible` / `not.visible` via `toBeOnTheScreen`
- [x] `checked` for Switch / checkbox role

## Query

- [x] `query.label` resolves TextInput by accessibility label
- [x] `query.button` resolves Pressable with role button
- [x] `query.dialog` / `query.listitem` resolve via accessibility label (mock engine)

## A11y snapshot

- [x] Snapshot includes role, name, and checked state on failure
