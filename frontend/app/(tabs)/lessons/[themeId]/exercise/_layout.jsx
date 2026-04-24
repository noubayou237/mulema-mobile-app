import { useEffect } from "react";
import { Stack } from "expo-router";
import { pauseBackgroundMusic, resumeBackgroundMusic } from "../../../../../src/hooks/useBackgroundMusic";

export default function ExerciseLayout() {
  useEffect(() => {
    pauseBackgroundMusic();
    return () => {
      resumeBackgroundMusic();
    };
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
  );
}
