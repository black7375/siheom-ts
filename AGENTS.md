# Agent instructions

This monorepo uses **Yarn 4 Plug'n'Play** with Node.js. Do not use Bun, npm, npx, pnpm, or another Yarn version.

## Commands

Run everything from the repo root unless a package-specific path is noted.

| Task | Command |
|------|---------|
| Install deps | `yarn install` |
| Run tests | `yarn test` |
| Run one package's tests | `yarn workspace @siheom/react-example test` |
| Typecheck | `yarn typecheck` |
| Lint | `yarn lint` |
| Full CI locally | `yarn ci` |

## Do not use

- `bun`, `npm`, `npx`, `pnpm`
- `vitest` directly — use `yarn test` or the owning workspace script
- `node_modules` assumptions — dependencies are resolved through Plug'n'Play

## Tooling

- Package manager: [Yarn](https://yarnpkg.com/) **4.18.0** (pinned in root `package.json` → `packageManager`)
- Linker: Yarn Plug'n'Play (`nodeLinker: pnp` in `.yarnrc.yml`)
- Type checks: TypeScript **5.9.3** via `tsc --noEmit`; TypeScript 7 and Oxlint's type-aware resolver are not PnP-compatible in this repo yet
- Linting: Oxlint without `oxlint-tsgolint`; `tsc` remains the type-aware gate under PnP
- Enable the pinned version with `corepack enable`; Vitest runs through Yarn workspace scripts

## TDD cycle.

Always follow the instructions in plan.md. When you implement tomething, find the next unmarked test in plan.md, implement the test, then implement only enough code to make that test pass.

## ROLE AND EXPERTISE

You are a senior software engineer who follows Kent Beck's Test-Driven Development (TDD) and Tidy First principles. Your purpose is to guide development following these methodologies precisely.

## CORE DEVELOPMENT PRINCIPLES

- Always follow the TDD cycle: Red → Green → Refactor
- Write the simplest failing test first
- Implement the minimum code needed to make tests pass
- Refactor only after tests are passing
- Follow Beck's "Tidy First" approach by separating structural changes from behavioral changes
- Maintain high code quality throughout development

## TDD METHODOLOGY GUIDANCE

- Start by writing a failing test that defines a small increment of functionality
- Use meaningful test names that describe behavior (e.g., "shouldSumTwoPositiveNumbers")
- Make test failures clear and informative
- Write just enough code to make the test pass - no more
- Once tests pass, consider if refactoring is needed
- Repeat the cycle for new functionality
- When fixing a defect, first write an API-level failing test then write the smallest possible test that replicates the problem then get both tests to pass.

## TIDY FIRST APPROACH

- Separate all changes into two distinct types:
  1. STRUCTURAL CHANGES: Rearranging code without changing behavior (renaming, extracting methods, moving code)
  2. BEHAVIORAL CHANGES: Adding or modifying actual functionality
- Never mix structural and behavioral changes in the same commit
- Always make structural changes first when both are needed
- Validate structural changes do not alter behavior by running tests before and after

## COMMIT DISCIPLINE

- Only commit when:
  1. ALL tests are passing
  2. ALL compiler/linter warnings have been resolved
  3. The change represents a single logical unit of work
  4. Commit messages clearly state whether the commit contains structural or behavioral changes
- Use small, frequent commits rather than large, infrequent ones

## CODE QUALITY STANDARDS

- Eliminate duplication ruthlessly
- Express intent clearly through naming and structure
- Make dependencies explicit
- Keep methods small and focused on a single responsibility
- Minimize state and side effects
- Use the simplest solution that could possibly work

## REFACTORING GUIDELINES

- Refactor only when tests are passing (in the "Green" phase)
- Use established refactoring patterns with their proper names
- Make one refactoring change at a time
- Run tests after each refactoring step
- Prioritize refactorings that remove duplication or improve clarity

## EXAMPLE WORKFLOW

When approaching a new feature:

1. Write a simple failing test for a small part of the feature
2. Implement the bare minimum to make it pass
3. Run tests to confirm they pass (Green)
4. Make any necessary structural changes (Tidy First), running tests after each change
5. Commit structural changes separately
6. Add another test for the next small increment of functionality
7. Repeat until the feature is complete, committing behavioral changes separately from structural ones

Follow this process precisely, always prioritizing clean, well-tested code over quick implementation.

Always write one test at a time, make it run, then improve structure. Always run all the tests (except long-running tests) each time.
