import type { Meta, StoryObj } from "@storybook/react-vite";

import { NoticeSearch } from "./NoticeSearch";

const meta = {
  component: NoticeSearch,
} satisfies Meta<typeof NoticeSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
