/**
 * MULEMA — Auth _layout.jsx
 * Stack simple pour les pages d'authentification.
 * Pas de vérification ici — le root _layout gère les redirections.
 */

import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}