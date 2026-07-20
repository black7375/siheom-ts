import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function LabeledSwitch({ label }: { label: string }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: enabled }}
        accessibilityLabel={label}
        onPress={() => setEnabled((current) => !current)}
      />
      <Text accessibilityLabel="status">{enabled ? "on" : "off"}</Text>
    </View>
  );
}
