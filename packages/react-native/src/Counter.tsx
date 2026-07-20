import { useState } from "react";
import { Pressable, Text } from "react-native";

export function Counter() {
  const [state, setState] = useState(0);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        setState((old) => old + 1);
      }}
    >
      <Text>{String(state)}</Text>
    </Pressable>
  );
}
