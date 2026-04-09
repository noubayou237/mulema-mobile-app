import { Platform, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Colors } from "../../src/theme/tokens";

/* Icônes emoji enfantines (Duolingo-style) */
const TAB_ICONS = {
  home:      { active: "🏡", inactive: "🏠" },
  lessons:   { active: "🗺️", inactive: "📖" },
  community: { active: "🏆", inactive: "🥈" },
  profile:   { active: "🦸", inactive: "🙂" },
};

const TabIcon = ({ name, focused, color }) => {
  const icons = TAB_ICONS[name] ?? { active: "⭐", inactive: "☆" };
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{
        fontSize: focused ? 26 : 22,
        lineHeight: focused ? 30 : 26,
        transform: [{ scale: focused ? 1.1 : 1 }],
      }}>
        {focused ? icons.active : icons.inactive}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
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
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
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
          title: "Accueil",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Aventure",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="lessons" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Classement",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="community" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
