import type { Meta, StoryObj } from "@storybook/react-vite";

import { TeamInviteForm } from "./TeamInviteForm";

const meta = {
  component: TeamInviteForm,
} satisfies Meta<typeof TeamInviteForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onInvite: async () => {},
  },
};
