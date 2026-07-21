import { describe, expect, it } from "vitest";

import { typeHanja } from "./typeHanja";

describe("typeHanja", () => {
  it("types 金泰熙 via 김태희 readings on Safari replace profile", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await typeHanja(input, "金泰熙", "김태희", { profile: "macos-safari-apple" });

    expect(input.value).toBe("金泰熙");
    input.remove();
  });

  it("types 金泰熙 via 김태희 readings on Chrome append profile", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await typeHanja(input, "金泰熙", "김태희", { profile: "macos-chrome-apple" });

    expect(input.value).toBe("金泰熙");
    input.remove();
  });

  it("throws when hanja and hangul lengths differ", async () => {
    const input = document.createElement("input");
    document.body.append(input);

    await expect(typeHanja(input, "金泰熙", "김태")).rejects.toThrow(/length must match/);
    input.remove();
  });
});
