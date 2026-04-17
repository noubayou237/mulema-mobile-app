/**
 * MULEMA — Lessons _layout.jsx
 * Stack interne : liste thèmes → détail thème → leçon → exercices → résultats
 */

import { Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../../src/hooks/useBackgroundMusic";

export default function LessonsLayout() {
  useFocusEffect(
    useCallback(() => {
      // Pause background music entirely while using the Lessons tab
      // to avoid overshadowing lesson/exercise audio.
      pauseBackgroundMusic();

      return () => {
        resumeBackgroundMusic();
      };
    }, [])
  );

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}