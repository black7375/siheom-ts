---
layout: home
title: siheom
titleTemplate: false
hero:
  name: siheom
  text: 접근성을 중심에 둔 데이터 기반 프론트엔드 테스트
  tagline: 시험을 데이터로 작성하고, 실제 브라우저에서 인터프리터가 실행합니다.
  actions:
    - theme: brand
      text: siheom이란
      link: /intro
    - theme: alt
      text: React 빠른 시작
      link: /getting-started/react
    - theme: alt
      text: English
      link: /en/
features:
  - title: 데이터로 쓰는 시험
    details: given, action, assert 스텝 배열입니다. 시험 본문에 await 없이 return runSiheom(...)으로 실행합니다.
  - title: 실제 브라우저
    details: vitest browser mode(Playwright provider)로 Chromium 등에서 UI를 렌더합니다. jsdom·happy-dom은 권장하지 않습니다.
  - title: role + name locator
    details: Playwright·Testing Library와 같은 접근성 정보로 요소를 지정합니다. CSS·test id는 쓰지 않습니다.
  - title: Factory 확장
    details: extendSiheom으로 커스텀 스텝을 레지스트리에 추가합니다. Playwright page object보다 시험 데이터와 같은 형태로 재사용합니다.
---
