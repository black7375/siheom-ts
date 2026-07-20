import type { Meta, StoryObj } from "@storybook/react-vite";

import { FocusStealComboboxLogger } from "./FocusStealComboboxLogger";

const meta = {
  title: "IME/Focus Steal Combobox",
  component: FocusStealComboboxLogger,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FocusStealComboboxLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = {
  args: {},
};
