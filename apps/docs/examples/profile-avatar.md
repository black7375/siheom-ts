# Profile Avatar — Upload + Avatar + Progress

파일을 업로드하면 진행률(Progress)이 올라가다가, 완료되면 아바타 이미지로 바뀌는 예제입니다. `actions.upload`와 `withFakeTimers`/`effect.elapsed`를 함께 써서, 실제 `setInterval`이 흐르는 시간을 제어합니다.

소스: [`apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.tsx), [`ProfileAvatar.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.test.tsx).

## UI

- 업로드 입력: `label` `"프로필 사진"` (시각적으로 숨겨진 `input[type=file]`과 연결)
- 진행률: role `progressbar`, name `"업로드 진행"` (업로드 중에만 존재)
- 완료 후 이미지: role `img`, name `"프로필 사진"`

## 시험: 업로드하고 완료까지 기다리기

```tsx
await runSiheom(
  withFakeTimers(
    given.render(<ProfileAvatar />),
    actions.upload(query.label("프로필 사진"), AVATAR_FILE),
    assertions.visible(query.progressbar("업로드 진행")),
    effect.elapsed(500),
    assertions.visible(query.img("프로필 사진")),
    assertions.not.visible(query.progressbar("업로드 진행")),
  ),
);
```

`ProfileAvatar`는 `setInterval(..., 125)`를 4번 반복해 진행률을 올립니다. `effect.elapsed(500)`은 가짜 타이머를 500ms만큼 흘려보내, 실제로 0.5초를 기다리지 않고도 "업로드가 끝난 뒤" 상태를 즉시 시험할 수 있게 합니다. [effect · withFakeTimers](/concepts/effects)를 참고하세요.

## 접근성 포인트

- 업로드 `input`은 `sr-only`로 시각적으로 숨겨져 있지만, `label`의 `htmlFor` 연결 덕분에 `query.label("프로필 사진")`으로 여전히 찾을 수 있습니다. 시각적으로 감춘 파일 입력을 스타일링된 버튼처럼 보이게 하는 흔한 패턴에서도 접근성 트리 상의 연결은 그대로 유지됩니다.
- 진행률(`progressbar`)은 업로드 중에만 존재하고, 완료 후에는 이미지(`img`)로 대체됩니다. 두 role이 동시에 존재하지 않는다는 것을 `assertions.not.visible`로 함께 확인해, "로딩 상태에서 결과 상태로 정확히 전환됐는지"를 놓치지 않습니다.

## 다음 단계

- [two-factor](/examples/two-factor) — Input OTP
- [effect · withFakeTimers](/concepts/effects) — 타이머 제어
- [actions API](/configuration/actions) — upload
