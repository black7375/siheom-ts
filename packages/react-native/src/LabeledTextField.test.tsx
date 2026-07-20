import { describe, it } from "vitest";
import { actions, assertions, given, query, runSiheom } from "./index.ts";
import { LabeledTextField } from "./fixtures/LabeledTextField.tsx";

describe("LabeledTextField", () => {
  it("fill clears then types by accessibility label", async () => {
    await runSiheom(
      given.render(<LabeledTextField label="이름" />),
      actions.fill(query.label("이름"), "홍길동"),
      assertions.textContent(query.label("이름 value"), "홍길동"),
    );
  });

  it("type appends into a labeled TextInput", async () => {
    await runSiheom(
      given.render(<LabeledTextField label="이름" />),
      actions.fill(query.label("이름"), "홍"),
      actions.type(query.label("이름"), "길동"),
      assertions.textContent(query.label("이름 value"), "홍길동"),
    );
  });
});
