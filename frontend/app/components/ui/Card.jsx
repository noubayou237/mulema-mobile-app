import { View } from "react-native";

export default function Card({ children }) {
  return (
    <View className="bg-card p-5 rounded-2xl border border-border">
      {children}
    </View>
  );
}