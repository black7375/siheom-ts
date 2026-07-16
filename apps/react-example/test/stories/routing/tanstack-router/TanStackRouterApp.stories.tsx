import type { Meta, StoryObj } from "@storybook/react-vite";

import { TanStackRouterApp } from "./TanStackRouterApp";
import { TanStackArticleList } from "./TanStackArticleList";

const meta = {
  title: "Routing/TanStack Router",
  component: TanStackRouterApp,
  parameters: {
    docs: {
      description: {
        component:
          "createMemoryHistory + RouterProvider로 Storybook에서 TanStack Router navigation을 확인합니다. 정적 href 테스트는 Link stub 스토리를 참고하세요.",
      },
    },
  },
} satisfies Meta<typeof TanStackRouterApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Index: Story = {
  name: "글 목록",
  args: {
    initialPath: "/",
  },
};

export const ArticleDetail: Story = {
  name: "글 상세",
  args: {
    initialPath: "/articles/2",
  },
};

export const StaticLinkStub: StoryObj<typeof TanStackArticleList> = {
  name: "Link stub (정적 href)",
  render: () => <TanStackArticleList />,
  parameters: {
    docs: {
      description: {
        story:
          "@showcase/tanstack-link alias는 Storybook·Vitest 모두 stub `<a>`로 resolve됩니다. TanStack navigation 스토리는 RouterProvider 안의 real Link를 사용합니다.",
      },
    },
  },
};
