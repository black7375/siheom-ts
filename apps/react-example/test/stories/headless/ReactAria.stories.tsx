import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReactAriaSubscribe } from "./ReactAria";

const meta = {
  component: ReactAriaSubscribe,
} satisfies Meta<typeof ReactAriaSubscribe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onSubscribe: async () => {},
  },
};
