/**
 * MULEMA — Profile _layout.jsx
 * Stack interne pour le profil, settings, notifications.
 * Ces pages ne s'affichent PAS comme des onglets séparés.
 */

import { Stack } from "expo-router";
 
export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
 