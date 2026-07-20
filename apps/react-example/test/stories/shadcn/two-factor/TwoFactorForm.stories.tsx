import type { Meta, StoryObj } from "@storybook/react-vite";

import { TwoFactorForm } from "./TwoFactorForm";

const meta = {
  component: TwoFactorForm,
} satisfies Meta<typeof TwoFactorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
