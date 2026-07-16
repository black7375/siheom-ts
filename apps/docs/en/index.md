---
layout: home
title: siheom
titleTemplate: false
hero:
  name: siheom
  text: Data-first frontend testing centered on accessibility
  tagline: Write tests as data; run them in a real browser via the interpreter.
  actions:
    - theme: brand
      text: What is siheom?
      link: /en/intro
    - theme: alt
      text: React quick start
      link: /en/getting-started/react
    - theme: alt
      text: 한국어
      link: /
features:
  - title: Tests as data
    details: Arrays of given, action, and assert steps. Run with return runSiheom(...) — no await in the test body.
  - title: Real browser
    details: vitest browser mode (Playwright provider) renders UI in Chromium, etc. jsdom and happy-dom are not recommended.
  - title: Role + name locators
    details: Same accessibility information as Playwright and Testing Library. No CSS or test ids.
  - title: Factory extension
    details: Add custom steps via extendSiheom registries — same shape as built-in steps, unlike Playwright page objects.
---
