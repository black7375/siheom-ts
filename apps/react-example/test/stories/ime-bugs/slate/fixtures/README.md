# Slate placeholder Hangul — capture fixtures

| Directory          | Browser | Meaning |
| ------------------ | ------- | ------- |
| `android-chrome/`  | Chrome  | Slate #5989 jamo-split on placeholder |
| `android-firefox/` | Firefox | Slate placeholder stuck-at-ㄱ; plain OK |
| `linux-chrome/`    | Chrome  | Desktop baseline — placeholder **works** |
| `linux-firefox/`   | Firefox | Desktop baseline — placeholder **works** |

## Android Chrome

| File | Visible | Notes |
| ---- | ------- | ----- |
| `broken-가-placeholder.json` | `ㄱㄱㅏㄱㅏ` | premature `compositionend`, jamo duplication |
| `fixed-가-plain-control.json` | `가` | second session after clear |

Profile: `android-chrome-slate-placeholder-broken` / `-plain-control`

## Android Firefox

| File | Visible | Notes |
| ---- | ------- | ----- |
| `broken-가-placeholder.json` | `ㄱ` (not `가`) | preedit `가` but `value` stuck at `ㄱ`; Firefox deferred `input` |
| `fixed-가-plain-control.json` | `가` | plain textarea — **works** (unlike Chrome first-try glitch) |

Profile: `android-firefox-slate-placeholder-broken` / `-plain-control`

**Cross-browser:** plain control baseline works on both browsers. Slate+placeholder failure mode **differs**:

| | Chrome | Firefox |
|---|--------|---------|
| Broken visible | `ㄱㄱㅏㄱㅏ` jamo split | `ㄱ` stuck (preedit `가`, DOM not updated) |
| Plain control | `가` (2nd session) | `가` (2nd session; 1st try also stuck in log) |
| Emulator plain input | ✅ | ✅ |
| Emulator Slate mount (Chromium) | ✅ repro | ❌ events replay; Slate composes `가` — **device-only** |

Storybook: **IME / Slate**.

## Linux Chrome / Firefox (desktop baseline)

| File | Visible | Notes |
| ---- | ------- | ----- |
| `fixed-가-placeholder.json` | `가` | normal `ㄱ→가` composition; Chrome placeholder may include ZWSP |
| `fixed-가-plain-control.json` | `가` | second session after clear |

Profile: `linux-chrome-slate-placeholder-fixed` / `-plain-control`, `linux-firefox-slate-*`

**Cross-platform:** Android Chrome/Firefox show Slate #5989 breakage on placeholder; **Linux desktop does not** — both Chrome and Firefox compose `가` correctly on Slate with placeholder. Firefox still emits deferred `input` after `compositionend` (same family as AF), but Slate DOM updates correctly on Linux.

