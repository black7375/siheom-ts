import type { Meta, StoryObj } from "@storybook/react-vite";

import { SaveFeedback } from "./SaveFeedback";

const meta = {
  component: SaveFeedback,
} satisfies Meta<typeof SaveFeedback>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
