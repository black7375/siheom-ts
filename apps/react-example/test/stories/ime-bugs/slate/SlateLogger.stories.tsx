import type { Meta, StoryObj } from "@storybook/react-vite";

import { SlateLogger } from "./SlateLogger";

const meta = {
  title: "IME/Slate",
  component: SlateLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SlateLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
