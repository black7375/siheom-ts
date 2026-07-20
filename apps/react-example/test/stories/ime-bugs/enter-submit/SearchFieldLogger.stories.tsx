import type { Meta, StoryObj } from "@storybook/react-vite";

import { SearchFieldLogger } from "./SearchFieldLogger";

const meta = {
  title: "IME/Enter Submit SearchField",
  component: SearchFieldLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SearchFieldLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
