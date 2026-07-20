import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import {
  SUBSCRIPTION_PLANS,
  type SubscribeData,
  type SubscriptionPlan,
} from "./subscribe.fixture.ts";

export function SubscribeForm({
  onSubscribe,
}: {
  onSubscribe: (data: SubscribeData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan | "">("");
  const [terms, setTerms] = useState(false);

  async function submit() {
    if (!plan) return;
    await onSubscribe({
      name,
      email,
      plan,
      terms,
    });
    setOpen(false);
  }

  return (
    <View accessibilityLabel="subscribe-section">
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)}>
        <Text>구독하기</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="none"
        transparent
        accessibilityViewIsModal
        onRequestClose={() => setOpen(false)}
      >
        <View accessibilityLabel="구독하기" style={{ padding: 16, gap: 12 }}>
          <TextInput accessibilityLabel="이름" value={name} onChangeText={setName} />
          <TextInput accessibilityLabel="이메일" value={email} onChangeText={setEmail} />

          <Text accessibilityRole="text">구독할 항목</Text>
          {SUBSCRIPTION_PLANS.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={item}
              accessibilityState={{ selected: plan === item }}
              onPress={() => setPlan(item)}
            >
              <Text>{item}</Text>
            </Pressable>
          ))}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="약관에 동의합니다"
            accessibilityState={{ checked: terms }}
            onPress={() => setTerms((current) => !current)}
          >
            <Text>약관에 동의합니다</Text>
          </Pressable>

          <Pressable accessibilityRole="button" accessibilityLabel="제출" onPress={submit}>
            <Text>구독하기</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
