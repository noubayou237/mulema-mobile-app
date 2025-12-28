// app/(tabs)/_layout.jsx
import React from "react";
import { View, Alert, TouchableOpacity } from "react-native";
import { Tabs, Redirect, useSegments } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header";
import BottomNav from "../components/bottom";
import { COLORS } from "../../constants/colors";
// import Statistiques fro../standalone/statstandalone/stats";

/**
 * Tabs layout centralisé :
 * - redirige vers (auth)/sign-in si pas connecté
 * - affiche un Header réutilisable (avec logout à droite)
 * - cache la tabBar native et affiche BottomNav personnalisé
 */

export default function TabsLayout() {
  const { isSignedIn, signOut } = useAuth();

  // si non connecté => redirect vers auth
  if (!isSignedIn) return <Redirect href={"/(auth)/sign-in"} />;

  // logout handler with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch (err) {
              console.error("Logout error:", err);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // compute active route segment to pass to BottomNav
  const segments = useSegments();
  const activeSegment = segments[segments.length - 1] || "home";

  // prepare a right element for header (logout button + optional extras)
  const headerRight = (
    <TouchableOpacity
      onPress={handleLogout}
      style={{
        marginRight: 6,
        backgroundColor: COLORS.primary,
        padding: 8,
        borderRadius: 20,
      }}
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={18} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background ?? "#fff" }}>
      {/* Header commun — tu peux remplacer title dynamic via segments if needed */}
      <Header title={titleForSegment(activeSegment)} right={headerRight} />

      {/* Tabs: we hide native tabBar (display:none) because we use BottomNav */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: "none" },
        }}
      >
        <Tabs.Screen name="home" options={{ title: "Home"}} />
        <Tabs.Screen name="lessons" options={{ title: "Lessons" }} />
        <Tabs.Screen name="exercices" options={{ title: "Exercices" }} />
        <Tabs.Screen name="community" options={{ title: "Community" }} />
        {/* <Tabs.Screen name="Statistiques" component={Statistiques} /> */}
      </Tabs>

      {/* Custom BottomNav positioned absolute inside its component */}
      <BottomNav activeKey={activeSegment} />
    </View>
  );
}

/* small helper to show nicer header titles based on segment */
function titleForSegment(seg) {
  switch (seg) {
    case "home":
      return "Home";
    case "lessons":
      return "Lessons";
    case "exercises":
      return "Exercises";
    case "community":
      return "Community";
    default:
      // if route is dynamic like 'exercise' or nested, you can refine here
      return "Exercises";
  }
}
