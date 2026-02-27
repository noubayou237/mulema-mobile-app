import { Text } from "react-native";

export default function AppText({ children }) {
  return (
    <Text className="text-base text-foreground leading-6">
      {children}
    </Text>
  );
}