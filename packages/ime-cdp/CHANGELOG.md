# @siheom/ime-cdp

## 0.3.0

### Minor Changes

- Chromium CDP Hangul composition backend for Vitest browser mode (`composeHangulCdp`, `createCdpImeActions`). Uses `Input.imeSetComposition` / `Input.insertText` for engine-backed ATDD and golden capture alongside `@siheom/ime` synthetic emulation.
