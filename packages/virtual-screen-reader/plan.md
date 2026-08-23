# @siheom/virtual-screen-reader

## Goal

Drive `@guidepup/virtual-screen-reader` from a `runSiheom` chain — givens to start/stop the virtual screen reader, effects to move its cursor and press/type through it, and assertions over the spoken phrase log. Proved on real React showcase UI (form-with-error, dialog, toast) in `@siheom/react-example`.

## Behaviors

### Phase 1 — registries (package tests, Vitest browser)

- [x] `createScreenReaderGivens().startScreenReader()` starts `virtual` over `document.body`; the cursor announces the first node
- [x] `stopScreenReader()` clears the spoken phrase log and is idempotent before `startScreenReader`
- [x] `screenReaderNext` / `screenReaderPrevious` move the cursor and update `lastSpokenPhrase`
- [x] `screenReaderPress("Enter")` on a button runs its default action (user-event) and refreshes the cursor
- [x] `screenReaderType(text)` types into the active editable and refreshes the cursor
- [x] `screenReaderPerform("jumpToErrorMessageElement")` jumps the cursor to an `aria-errormessage` target, whose text content the cursor announces on the next step
- [x] `screenReaderAct()` clicks the active node
- [x] `screenReaderClearLog()` clears the spoken phrase log
- [x] Assertions: `screenReaderItemText`, `screenReaderLastSpokenPhrase`, `screenReaderSpokenPhraseLog`, `screenReaderContainsSpokenPhrase`, `screenReaderCursorOn`
- [x] Live-region announcements land in the spoken phrase log as `polite:`/`assertive:` phrases (`role="status"` / `role="alert"`)
- [ ] `createVirtualScreenReaderExtension` registers the new keys via `extendSiheom` (no key collisions)

### Phase 2 — react-example showcase

- [ ] `createVirtualScreenReaderSiheom` helper (extendSiheom over `@siheom/react` runtime)
- [ ] Storybook: form-with-error, dialog, toast stories
- [ ] Form-with-error test: submit empty form → screen reader announces each error message
- [ ] Dialog test: open alert dialog → screen reader announces the dialog title/content
- [ ] Toast test: click 저장 → screen reader announces the toast via live region