import type { Meta, StoryObj } from "@storybook/react-vite";

import { SettingsPanel } from "./SettingsPanel";

const meta = {
  component: SettingsPanel,
} satisfies Meta<typeof SettingsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
