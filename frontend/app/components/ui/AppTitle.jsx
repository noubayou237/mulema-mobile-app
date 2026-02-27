import { Text } from "react-native";

export default function AppTitle({ children }) {
  return (
    <Text className="text-3xl font-bold text-foreground">
      {children}
    </Text>
  );
}