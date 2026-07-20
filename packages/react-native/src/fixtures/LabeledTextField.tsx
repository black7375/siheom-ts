import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export function LabeledTextField({ label }: { label: string }) {
  const [value, setValue] = useState("");

  return (
    <View>
      <TextInput accessibilityLabel={label} value={value} onChangeText={setValue} />
      <Text accessibilityLabel={`${label} value`}>{value || "(empty)"}</Text>
    </View>
  );
}
