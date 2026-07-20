import type { Meta, StoryObj } from "@storybook/react-vite";

import { KanbanBoard } from "./KanbanBoard";

const meta = {
  component: KanbanBoard,
} satisfies Meta<typeof KanbanBoard>;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
