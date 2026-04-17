import { Stack } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../src/hooks/useBackgroundMusic";

export default function ExercicesLayout() {
  useFocusEffect(
    useCallback(() => {
      // Pause background music entirely while using the Exercices stack
      // to avoid overshadowing exercise audio.
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
