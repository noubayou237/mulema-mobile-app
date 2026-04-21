import { Platform, Text, View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../src/theme/tokens";
import { useTranslation } from "react-i18next";

const TAB_ICONS = {
  lessons: "book",
  exercises: "barbell",
  home: "home",
  community: "people",
  profile: "person", // using 'person' for the Profil tab, outline logic adds '-outline'
};

const TabIcon = ({ name, focused, color }) => {
  const iconBase = TAB_ICONS[name] || "star";
  const iconName = focused || name === "home" ? iconBase : `${iconBase}-outline`;

  if (name === "home") {
    // Custom elevated styling for Home
    return (
      <View style={styles.homeButtonWrapper}>
        <View style={styles.homeButtonInner}>
          <Ionicons name={iconName} size={28} color="#FFFFFF" />
        </View>
      </View>
    );
  }

  // Standard styling for other tabs
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingTop: 4 }}>
      <Ionicons name={iconName} size={24} color={color} style={{ opacity: focused ? 1 : 0.7 }} />
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
          height: Platform.OS === "ios" ? 95 : 75,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Fredoka_600SemiBold",
          fontSize: 11,
          marginTop: 2,
        },
      }}
    >
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
        name="home"
        options={{
          title: t("nav.home", "Accueil"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
          tabBarLabelStyle: {
            fontFamily: "Fredoka_600SemiBold",
            fontSize: 11,
            marginTop: 18, // Push the label down below the elevated circle
            color: Colors.primary,
          },
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("nav.community", "Social"),
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="community" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("nav.profile", "Profil"),
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

const styles = StyleSheet.create({
  homeButtonWrapper: {
    top: -16, // Elevate above the tab bar
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Colors.surfaceContainerLowest, // Match tab bar bg for the cutout effect
    alignItems: "center",
    justifyContent: "center",
  },
  homeButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary, // Red color
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
});
