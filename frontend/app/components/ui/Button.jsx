import { Pressable, Text } from "react-native";

export default function Button({ title, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-primary py-4 rounded-xl items-center"
    >
      <Text className="text-white font-semibold text-base">
        {title}
      </Text>
    </Pressable>
  );
}