import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChartDashboard } from "./ChartDashboard";

const meta = {
  component: ChartDashboard,
} satisfies Meta<typeof ChartDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
