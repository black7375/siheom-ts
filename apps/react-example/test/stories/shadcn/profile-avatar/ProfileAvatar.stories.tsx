import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProfileAvatar } from "./ProfileAvatar";

const meta = {
  component: ProfileAvatar,
} satisfies Meta<typeof ProfileAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
