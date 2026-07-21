import type { Meta, StoryObj } from "@storybook/react-vite";

import { LexicalLogger } from "./LexicalLogger";

const meta = {
  title: "IME/Lexical",
  component: LexicalLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LexicalLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
