import type { Meta, StoryObj } from "@storybook/react-vite";

import { MeetingBookingForm } from "./MeetingBookingForm";

const meta = {
  component: MeetingBookingForm,
} satisfies Meta<typeof MeetingBookingForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
