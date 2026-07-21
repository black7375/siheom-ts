import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChatMessageFieldLogger } from "./ChatMessageFieldLogger";

const meta = {
  title: "IME/Candidate Conversion Chat",
  component: ChatMessageFieldLogger,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChatMessageFieldLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = { args: {} };
