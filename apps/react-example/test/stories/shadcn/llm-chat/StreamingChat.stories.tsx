import type { Meta, StoryObj } from "@storybook/react-vite";

import { StreamingChat } from "./StreamingChat";

const meta = {
  component: StreamingChat,
} satisfies Meta<typeof StreamingChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
