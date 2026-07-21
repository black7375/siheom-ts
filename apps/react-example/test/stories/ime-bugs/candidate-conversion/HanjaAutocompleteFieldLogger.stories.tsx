import type { Meta, StoryObj } from "@storybook/react-vite";

import { HanjaAutocompleteFieldLogger } from "./HanjaAutocompleteFieldLogger";

const meta = {
  title: "IME/Hanja Autocomplete Conflict",
  component: HanjaAutocompleteFieldLogger,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HanjaAutocompleteFieldLogger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Capture: Story = { args: {} };
