import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
  stories: ["../test/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  framework: "@storybook/react-native-web-vite",
};

export default config;
