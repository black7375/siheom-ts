import type { Meta, StoryObj } from "@storybook/react-vite";

import { TwoFactorForm } from "./TwoFactorForm";

const meta = {
  component: TwoFactorForm,
} satisfies Meta<typeof TwoFactorForm>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
