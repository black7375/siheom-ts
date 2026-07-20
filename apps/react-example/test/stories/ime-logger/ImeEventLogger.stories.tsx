import type { Meta, StoryObj } from "@storybook/react-vite";

import { ImeEventLogger } from "./ImeEventLogger";

const meta = {
  title: "IME/Event Logger",
  component: ImeEventLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ImeEventLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
