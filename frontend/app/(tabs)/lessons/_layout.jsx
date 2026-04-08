/**
 * MULEMA — Lessons _layout.jsx
 * Stack interne : liste thèmes → détail thème → leçon → exercices → résultats
 */

import { Stack } from "expo-router";

export default function LessonsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}