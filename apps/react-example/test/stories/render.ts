import {
  render as testingLibraryRender,
  waitFor as testingLibraryWaitFor,
} from "@testing-library/react";

export async function render(element: React.ReactNode) {
  return testingLibraryRender(element);
}

export const waitFor = testingLibraryWaitFor;
