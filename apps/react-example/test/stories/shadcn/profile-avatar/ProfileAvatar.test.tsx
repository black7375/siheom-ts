import "../../../index.css";
import { describe, it } from "vitest";
import {
  actions,
  assertions,
  effect,
  given,
  query,
  runSiheom,
  withFakeTimers,
} from "@siheom/react";
import { AVATAR_FILE } from "./avatar.fixture";
import { ProfileAvatar } from "./ProfileAvatar.tsx";

describe("ProfileAvatar", () => {
  it("프로필 사진을 업로드할 수 있다", async () => {
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
  });
});
