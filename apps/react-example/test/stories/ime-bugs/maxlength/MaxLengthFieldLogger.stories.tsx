import type { Meta, StoryObj } from "@storybook/react-vite";

import { MaxLengthFieldLogger } from "./MaxLengthFieldLogger";

const meta = {
  title: "IME/MaxLength Field",
  component: MaxLengthFieldLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MaxLengthFieldLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
