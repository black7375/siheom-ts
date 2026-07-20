import type { Meta, StoryObj } from "@storybook/react-vite";

import { SaveFeedback } from "./SaveFeedback";

const meta = {
  component: SaveFeedback,
};

export default meta satisfies Meta<typeof SaveFeedback>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
