# @siheom/core — coverage behaviors

Intentional gaps (not line fillers). Target: statements ≥ 90%.
Prefer exercising public APIs through `runSiheom` / `defaultActions` / `defaultAssertions`.

## Runner

- [ ] Assert steps dispatch through `runSiheom` (success)
- [ ] Failed assertion includes logs and a non-empty a11y snapshot section
- [ ] Invalid step throws `"Invalid step"`

## Actions (user-event behavior)

- [ ] `fill` clears then types into a textbox
- [ ] `type` appends into a focused textbox
- [ ] `dblclick` fires on a button
- [ ] `hover` moves pointer over a target (observable via mouseenter handler)
- [ ] `tab` moves focus from the currently focused control
- [ ] `upload` puts a File into a file input

## Assertions

- [ ] `visible` / `not.visible` (present vs missing vs aria-hidden)
- [ ] `selected` / `not.selected` via aria-selected
- [ ] `disabled` for native `disabled` and `aria-disabled`
- [ ] `current` / `not.current` via aria-current
- [ ] `count` / `not.count` for multiple matches
- [ ] `value` / `href` / `errormessage` / `description`
- [ ] `expanded` true/false
- [ ] `checked` for radio inputs
- [ ] `a11ySnapshot` matches a compact accessible tree
- [ ] `tableSnapshot` matches markdown for a simple table

## Query

- [ ] `query.label` resolves by accessible label text
- [ ] Invisible query path used by `visible(false)`

## A11y failure formatting (via getA11ySnapshot / failing assert)

- [x] Snapshot includes role, name, and checked state
- [x] Snapshot includes heading level / haspopup properties
- [x] Snapshot includes aria-describedby / aria-errormessage relations
- [x] Accessible names with quotes/newlines are escaped

## tableToMarkdown

- [x] Renders thead/tbody cells as padded markdown
- [x] Empty table throws
