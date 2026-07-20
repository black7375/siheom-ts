import { describe, expect, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react-native";
import { withTamagui } from "../../withTamagui.tsx";
import { SubscribeForm } from "./Subscribe.tsx";
import { SUBSCRIBER } from "./subscribe.fixture.ts";

describe("SubscribeForm", () => {
  it("구독하기 dialog에서 폼을 작성하고 제출하면 dialog가 닫힌다", async () => {
    let result: unknown = null;

    await runSiheom(
      given.render(
        withTamagui(
          <SubscribeForm
            onSubscribe={async (data) => {
              result = data;
            }}
          />,
        ),
      ),
      actions.click(query.button("구독하기")),
      assertions.visible(query.dialog("구독하기")),

      actions.fill(query.within(query.dialog("구독하기"), query.label("이름")), SUBSCRIBER.name),
      actions.fill(query.within(query.dialog("구독하기"), query.label("이메일")), SUBSCRIBER.email),
      actions.click(query.within(query.dialog("구독하기"), query.button(SUBSCRIBER.plan))),
      actions.click(query.within(query.dialog("구독하기"), query.checkbox("약관에 동의합니다"))),
      assertions.checked(
        query.within(query.dialog("구독하기"), query.checkbox("약관에 동의합니다")),
      ),
      actions.click(query.within(query.dialog("구독하기"), query.button("제출"))),

      assertions.not.visible(query.dialog("구독하기")),
    );

    expect(result).toEqual({
      name: SUBSCRIBER.name,
      email: SUBSCRIBER.email,
      plan: SUBSCRIBER.plan,
      terms: true,
    });
  });
});
