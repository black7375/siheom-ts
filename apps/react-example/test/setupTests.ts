import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanupReactRoots } from "@siheom/react";
import "./index.css";

declare global {
  // React 19 browser tests need an explicit act environment flag.
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// guidepup's virtual screen reader can fire an in-flight live-region
// announcement after `virtual.stop()`; on a detached node its
// dom-accessibility-api call throws `root.getElementById is not a function`.
// That rejection is unhandled (the MutationObserver callback doesn't await
// it), so swallow it here to keep runs deterministic.
window.addEventListener("unhandledrejection", (event) => {
  if (String(event.reason?.message ?? "").includes("getElementById is not a function")) {
    event.preventDefault();
  }
});

afterEach(async () => {
  await cleanupReactRoots();
});
