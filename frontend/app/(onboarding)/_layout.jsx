/**
 * MULEMA — Onboarding _layout.jsx
 * ChoiceLanguage → PageVideo → (tabs)/home
 */

import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}