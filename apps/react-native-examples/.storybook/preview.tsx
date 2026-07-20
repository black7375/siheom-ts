import type { Preview } from "@storybook/react-native-web-vite";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../test/tamagui.config.ts";

const preview: Preview = {
  decorators: [
    (Story) => (
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
        <Story />
      </TamaguiProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
