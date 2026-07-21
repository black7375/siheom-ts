# Profile Avatar — Upload + Avatar + Progress

Uploading a file drives a Progress bar upward until it completes and swaps in the avatar image. `actions.upload` combines with `withFakeTimers`/`effect.elapsed` to control the time an actual `setInterval` takes to run.

Source: [`apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.tsx), [`ProfileAvatar.test.tsx`](https://github.com/twinstae/siheom-ts/blob/main/apps/react-example/test/stories/shadcn/profile-avatar/ProfileAvatar.test.tsx).

## UI

- Upload input: `label` `"프로필 사진"` (linked to a visually hidden `input[type=file]`)
- Progress: role `progressbar`, name `"업로드 진행"` (only exists while uploading)
- Image after completion: role `img`, name `"프로필 사진"`

## Test: upload and wait for completion

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

`ProfileAvatar` runs `setInterval(..., 125)` four times to advance progress. `effect.elapsed(500)` fast-forwards the fake timers by 500ms, letting the test reach the "upload finished" state instantly instead of waiting half a second for real. See [effect · withFakeTimers](/en/concepts/effects).

## Accessibility notes

- The upload `input` is visually hidden with `sr-only`, but `query.label("프로필 사진")` still finds it through the `label`'s `htmlFor` link. Even with the common pattern of styling a file input to look like a button, the accessibility-tree connection stays intact.
- The `progressbar` only exists while uploading, replaced by the `img` once done. Confirming both with `assertions.not.visible`/`assertions.visible` together catches the exact transition from a loading state to a result state, not just "the end state eventually shows up."

## Next steps

- [two-factor](/en/examples/two-factor) — Input OTP
- [effect · withFakeTimers](/en/concepts/effects) — Controlling timers
- [actions API](/en/configuration/actions) — upload
