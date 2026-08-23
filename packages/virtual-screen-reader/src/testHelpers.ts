import {
  createDefaultActions,
  createDefaultAssertions,
  defaultEffects,
  extendSiheom,
} from "@siheom/core";
import { createVirtualScreenReaderExtension } from "./createVirtualScreenReaderExtension.ts";

/** Plain-DOM siheom pre-bound to the virtual screen reader registries. */
export function setupSiheom() {
  return extendSiheom(
    {
      actions: createDefaultActions(),
      assertions: createDefaultAssertions(),
      givens: {
        render: async (node: Node) => {
          document.body.innerHTML = "";
          document.body.appendChild(node);
        },
      },
      effects: defaultEffects,
    },
    createVirtualScreenReaderExtension(),
  );
}

export function button(text: string) {
  const el = document.createElement("button");
  el.textContent = text;
  return el;
}

export function buttonWithHandler(text: string, onClick: () => void) {
  const el = button(text);
  el.addEventListener("click", onClick);
  return el;
}

export function labelInput() {
  const label = document.createElement("label");
  label.setAttribute("for", "name");
  label.textContent = "이름";
  const input = document.createElement("input");
  input.id = "name";
  const container = document.createElement("div");
  container.append(label, input);
  return { el: container, input };
}

export function errorField() {
  const label = document.createElement("label");
  label.setAttribute("for", "email");
  label.textContent = "이메일";
  const input = document.createElement("input");
  input.id = "email";
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-errormessage", "email-error");
  const error = document.createElement("div");
  error.id = "email-error";
  error.setAttribute("role", "alert");
  error.textContent = "올바른 이메일 형식이 아닙니다";
  const container = document.createElement("div");
  container.append(label, input, error);
  return container;
}

export function liveStatus() {
  const button = document.createElement("button");
  button.textContent = "알림 표시";
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.textContent = "알림";
  button.addEventListener("click", () => {
    status.textContent = "저장됨";
  });
  const container = document.createElement("div");
  container.append(button, status);
  return container;
}