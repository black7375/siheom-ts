import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export function ConditionalBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <View>
      <Pressable accessibilityRole="button" onPress={() => setVisible(false)}>
        <Text>hide</Text>
      </Pressable>
      {visible ? <Text accessibilityRole="text">banner</Text> : null}
    </View>
  );
}
