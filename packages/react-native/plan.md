# @siheom/react-native — coverage behaviors

RNTL-backed runtime. Target: exercise public APIs through `runSiheom`.

## Runner

- [x] Counter press increments visible button label
- [ ] Failed assertion includes RN a11y snapshot section

## Actions

- [ ] `click` maps to `userEvent.press`
- [ ] `fill` clears then types into a labeled TextInput
- [ ] `type` appends into a TextInput

## Assertions

- [ ] `visible` / `not.visible` via `toBeOnTheScreen`
- [ ] `checked` for Switch / checkbox role

## Query

- [ ] `query.label` resolves TextInput by accessibility label
- [ ] `query.button` resolves Pressable with role button

## A11y snapshot

- [ ] Snapshot includes role, name, and checked state on failure
