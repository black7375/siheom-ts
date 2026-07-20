import { render } from "@testing-library/react";
import { overrideSiheom, defaultActions, defaultAssertions, defaultEffects } from "@siheom/core";
import { TooltipProvider } from "@/components/ui/tooltip";
import { defaultGivens } from "@siheom/react";

function TestProvider({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

export const { runSiheom } = overrideSiheom(
  {
    givens: defaultGivens,
    actions: defaultActions,
    assertions: defaultAssertions,
    effects: defaultEffects,
  },
  {
    givens: {
      render: async (element: React.ReactElement) => {
        render(<TestProvider>{element}</TestProvider>);
      },
    },
  },
);
