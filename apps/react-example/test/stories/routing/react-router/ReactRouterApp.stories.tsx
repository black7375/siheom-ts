import type { Meta, StoryObj } from "@storybook/react-vite";

import { ReactRouterApp } from "./ReactRouterApp";

const meta = {
  title: "Routing/React Router",
  component: ReactRouterApp,
  parameters: {
    docs: {
      description: {
        component:
          "MemoryRouter로 Storybook에서도 라우트 전환을 확인할 수 있습니다. 정적 href, hash, async push 시나리오를 포함합니다.",
      },
    },
  },
} satisfies Meta<typeof ReactRouterApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArticleList: Story = {
  name: "글 목록",
  args: {
    initialEntries: ["/"],
  },
};

export const ArticleDetail: Story = {
  name: "글 상세",
  args: {
    initialEntries: ["/articles/2"],
  },
};

export const TermsWithHash: Story = {
  name: "약관 (hash)",
  args: {
    initialEntries: ["/terms"],
  },
};

export const TermsSignSection: Story = {
  name: "약관 (서명 섹션)",
  args: {
    initialEntries: ["/terms#sign"],
  },
};

export const LoginFlow: Story = {
  name: "로그인 → 대시보드",
  args: {
    initialEntries: ["/login"],
    login: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
  },
};

export const Dashboard: Story = {
  name: "대시보드",
  args: {
    initialEntries: ["/dashboard"],
  },
};
