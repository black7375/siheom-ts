import type { Meta, StoryObj } from "@storybook/react-vite";

import { SignUpForm } from "../SignUpForm";

const meta = {
  component: SignUpForm,
  args: {
    signUpMember: async () => {},
  },
} satisfies Meta<typeof SignUpForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
