import { render } from "@/stories/render";
import { overrideSiheom, defaultActions, defaultAssertions } from "@siheom/core";
import { defaultGivens, reactEffects, reactFakeTimerScope } from "@siheom/react";
import { TooltipProvider } from "@/components/ui/tooltip";

function TestProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

export const { runSiheom } = overrideSiheom(
  {
    givens: defaultGivens,
    actions: defaultActions,
    assertions: defaultAssertions,
    effects: reactEffects,
    fakeTimerScope: reactFakeTimerScope,
  },
  {
    givens: {
      render: async (element: React.ReactElement) => {
        await render(<TestProvider>{element}</TestProvider>);
      },
    },
  },
);
