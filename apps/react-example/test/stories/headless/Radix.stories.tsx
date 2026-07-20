import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadixSubscribe } from "./Radix";

const meta = {
  component: RadixSubscribe,
} satisfies Meta<typeof RadixSubscribe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onSubscribe: async () => {},
  },
};
