import { Platform, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../src/theme/tokens";
import { useTranslation } from "react-i18next";

const TAB_ICONS = {
  home: { active: "🏡", inactive: "🏠" },
  lessons: { active: "🗺️", inactive: "📖" },
  exercises: { active: "📝", inactive: "✍️" },
  community: { active: "🏆", inactive: "🥈" },
  profile: { active: "🦸", inactive: "👤" },
};

const TabIcon = ({ name, focused, color }) => {
  const icons = TAB_ICONS[name] ?? { active: "⭐", inactive: "☆" };
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{
        fontSize: focused ? 26 : 22,
        lineHeight: focused ? 30 : 26,
        transform: [{ scale: focused ? 1.1 : 1 }],
        opacity: focused ? 1 : 0.7,
      }}>
        {focused ? icons.active : icons.inactive}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surfaceContainerLowest,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
          height: Platform.OS === "ios" ? 100 : 80,
          paddingBottom: Platform.OS === "ios" ? 36 : 14,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontFamily: "Fredoka_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t("nav.home"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: t("nav.lessons"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="lessons" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t("nav.exercises", "Exercices"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="exercises" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("nav.community"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="community" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="profile" focused={focused} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Force reset to index when clicking the profile tab
            navigation.navigate("profile", { screen: "index" });
          },
        })}
      />
    </Tabs>
  );
}
