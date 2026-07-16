import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Counter() {
  const [state, setState] = useState(0);

  return (
    <Button
      onClick={() => {
        setState((old) => old + 1);
      }}
    >
      {state}
    </Button>
  );
}
