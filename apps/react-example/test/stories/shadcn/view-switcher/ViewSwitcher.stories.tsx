import type { Meta, StoryObj } from "@storybook/react-vite";

import { ViewSwitcher } from "./ViewSwitcher";

const meta = {
  component: ViewSwitcher,
} satisfies Meta<typeof ViewSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
