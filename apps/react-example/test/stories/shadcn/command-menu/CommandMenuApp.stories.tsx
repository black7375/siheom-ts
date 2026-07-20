import type { Meta, StoryObj } from "@storybook/react-vite";

import { CommandMenuApp } from "./CommandMenuApp";

const meta = {
  component: CommandMenuApp,
} satisfies Meta<typeof CommandMenuApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
