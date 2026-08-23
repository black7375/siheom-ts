import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { virtual } from "@guidepup/virtual-screen-reader";

afterEach(async () => {
  await virtual.stop();
});
