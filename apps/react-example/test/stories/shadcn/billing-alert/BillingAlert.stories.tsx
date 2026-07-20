import type { Meta, StoryObj } from "@storybook/react-vite";

import { BillingAlert } from "./BillingAlert";

const meta = {
  component: BillingAlert,
} satisfies Meta<typeof BillingAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
