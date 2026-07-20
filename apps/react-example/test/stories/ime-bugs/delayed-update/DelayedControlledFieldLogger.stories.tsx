import type { Meta, StoryObj } from "@storybook/react-vite";

import { DelayedControlledFieldLogger } from "./DelayedControlledFieldLogger";

const meta = {
  title: "IME/Delayed Controlled Update",
  component: DelayedControlledFieldLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof DelayedControlledFieldLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
