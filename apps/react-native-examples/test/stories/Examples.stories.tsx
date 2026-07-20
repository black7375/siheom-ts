import type { Meta, StoryObj } from "@storybook/react-native-web-vite";
import { withTamagui } from "../withTamagui.tsx";
import { SubscribeForm } from "./headless/Subscribe.tsx";
import { TodoLite } from "./todomvc/TodoLite.tsx";

const meta = {
  title: "Examples",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SubscribeFormStory: Story = {
  name: "SubscribeForm",
  render: () =>
    withTamagui(
      <SubscribeForm
        onSubscribe={async () => {
          /* storybook preview */
        }}
      />,
    ),
};

export const TodoLiteStory: Story = {
  name: "TodoLite",
  render: () => withTamagui(<TodoLite />),
};
