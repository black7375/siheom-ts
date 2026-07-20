import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderTracking } from "./OrderTracking";

const meta = {
  component: OrderTracking,
} satisfies Meta<typeof OrderTracking>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
