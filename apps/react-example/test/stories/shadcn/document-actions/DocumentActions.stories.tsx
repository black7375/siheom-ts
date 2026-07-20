import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocumentActions } from "./DocumentActions";

const meta = {
  component: DocumentActions,
} satisfies Meta<typeof DocumentActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
