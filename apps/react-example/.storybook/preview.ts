import React from "react";
import type { Preview } from "@storybook/react-vite";

import "../test/index.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) =>
      React.createElement(
        "div",
        { className: "min-h-screen bg-background font-sans text-foreground antialiased" },
        React.createElement(Story),
      ),
  ],
};

export default preview;
