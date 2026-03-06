import { View, ScrollView } from "react-native";

export default function ScreenLayout({ children }) {
  return (
    <ScrollView
      className="flex-1 bg-background px-6 pt-12"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="gap-6">
        {children}
      </View>
    </ScrollView>
  );
}