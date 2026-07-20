import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArkUiSubscribe } from "./ArkUi";

const meta = {
  component: ArkUiSubscribe,
} satisfies Meta<typeof ArkUiSubscribe>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onSubscribe: async () => {},
  },
};
