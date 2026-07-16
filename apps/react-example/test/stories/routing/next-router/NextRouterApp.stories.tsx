import type { Meta, StoryObj } from "@storybook/react-vite";

import { NextRouterApp } from "./NextRouterApp";

const meta = {
  title: "Routing/Next Router (fake)",
  component: NextRouterApp,
  parameters: {
    docs: {
      description: {
        component:
          "next-router-mock 대신 FakeNextRouterProvider로 push/replace, useSearchParams, query string 파싱을 Storybook에서 재현합니다.",
      },
    },
  },
} satisfies Meta<typeof NextRouterApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoticeIndex: Story = {
  name: "공지 목록",
  args: {
    initialPath: "/",
  },
};

export const NoticeWithQuery: Story = {
  name: "공지 상세 (?id=123)",
  args: {
    initialPath: "/notice?id=123",
  },
};

export const NoticeWithQuery456: Story = {
  name: "공지 상세 (?id=456)",
  args: {
    initialPath: "/notice?id=456",
  },
};
