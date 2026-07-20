import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./AppShell";

const meta = {
  component: AppShell,
} satisfies Meta<typeof AppShell>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
