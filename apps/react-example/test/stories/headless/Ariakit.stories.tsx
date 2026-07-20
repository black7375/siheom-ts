import type { Meta, StoryObj } from "@storybook/react-vite";

import { AriakitSubscribe } from "./Ariakit";

const meta = {
  component: AriakitSubscribe,
} satisfies Meta<typeof AriakitSubscribe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onSubscribe: async () => {},
  },
};
