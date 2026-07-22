import type { Meta, StoryObj } from "@storybook/react-vite";

import { TipTapLogger } from "./TipTapLogger";

const meta = {
  title: "IME/TipTap",
  component: TipTapLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof TipTapLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
