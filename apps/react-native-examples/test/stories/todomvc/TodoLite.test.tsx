import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "@siheom/react-native";
import { withTamagui } from "../../withTamagui.tsx";
import { TodoLite } from "./TodoLite.tsx";

describe("TodoLite", () => {
  it("Enter로 할 일을 추가한다", async () => {
    await runSiheom(
      given.render(withTamagui(<TodoLite />)),
      actions.fill(query.label("What needs to be done?"), "Buy milk{Enter}"),
      assertions.visible(query.listitem("Buy milk")),
      assertions.visible(query.list("todo list")),
    );
  });

  it("체크박스로 할 일을 완료할 수 있다", async () => {
    await runSiheom(
      given.render(withTamagui(<TodoLite />)),
      actions.fill(query.label("What needs to be done?"), "Buy milk{Enter}"),
      actions.click(query.checkbox("Mark Buy milk as complete")),
      assertions.checked(query.checkbox("Mark Buy milk as complete")),
    );
  });
});
