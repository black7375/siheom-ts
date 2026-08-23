import type { Meta, StoryObj } from "@storybook/react-vite";

import { DeleteDialog } from "../DeleteDialog";

const meta = {
  component: DeleteDialog,
  args: {
    initialItems: ["회의 준비", "이메일 답장"],
  },
} satisfies Meta<typeof DeleteDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
