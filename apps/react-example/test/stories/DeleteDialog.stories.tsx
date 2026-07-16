import type { Meta, StoryObj } from "@storybook/react-vite";

import { DeleteDialog } from "./DeleteDialog";

const meta = {
  component: DeleteDialog,
} satisfies Meta<typeof DeleteDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    initialItems: ["밥 먹기", "운동하기", "코딩하기"],
  },
};
