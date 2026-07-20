import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function createTodo(title: string): Todo {
  return { id: `${Date.now()}-${title}`, title, completed: false };
}

export function TodoLite() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");

  function addTodo() {
    const title = draft.trim();
    if (!title) return;
    setTodos((current) => [...current, createTodo(title)]);
    setDraft("");
  }

  return (
    <View accessibilityLabel="todos">
      <TextInput
        accessibilityLabel="What needs to be done?"
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={addTodo}
      />

      {todos.length > 0 ? (
        <View accessibilityRole="list" accessibilityLabel="todo list">
          {todos.map((item) => (
            <View key={item.id} accessibilityLabel={item.title}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={`Mark ${item.title} as complete`}
                accessibilityState={{ checked: item.completed }}
                onPress={() => {
                  setTodos((current) =>
                    current.map((todo) =>
                      todo.id === item.id ? { ...todo, completed: !todo.completed } : todo,
                    ),
                  );
                }}
              />
              <Text>{item.title}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
