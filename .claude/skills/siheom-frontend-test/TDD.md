# TDD and Tidy First

Use this when the repo has **no** `AGENTS.md`. If `AGENTS.md` exists, follow it; this file is the same discipline in portable form.

## Core cycle

**Red → Green → Refactor.** One test at a time. One small increment per cycle.

- **Red** — simplest failing test that describes behavior
- **Green** — minimum code to pass; no extra features
- **Refactor** — tidy only while tests are green

## plan.md

Create `plan.md` beside the feature (from the product spec). Each `- [ ]` line is **one cycle**:

1. Next unchecked item only
2. Write the failing `it`
3. Minimum production code to pass
4. Run tests (full suite for the package, not just the new file)
5. Refactor if needed (structural commit separate)
6. Mark `[x]`, commit, repeat

## Tidy First

| Type | Examples |
| ---- | -------- |
| **Structural** | Rename, extract, move, shadcn swap, prune duplicate tests |
| **Behavioral** | New `it`, new user-visible behavior |

Never mix both in one commit. Structural first when both are needed. Tests must pass before and after structural work.

## Commit discipline

Commit only when:

1. All tests pass
2. Typecheck clean (if the project has it)
3. Lint/format clean (if the project has it)
4. One logical unit of work
5. Message states **structural** vs **behavioral** (or `refactor` / `feat` / `test`)

Small, frequent commits.

## Bug fixes

1. API-level failing test (user-visible symptom)
2. Smallest test that reproduces the root cause
3. Fix until both pass

## Code quality (while refactoring)

- Remove duplication
- Pure functions for derived state
- Explicit dependencies, small methods
- Simplest solution that works

## Anti-pattern: big-bang implementation

Do **not** scaffold the whole feature then add tests. If that already happened: **trim** to what tests cover, commit structural, resume `plan.md`.
