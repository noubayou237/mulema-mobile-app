import { Stack } from "expo-router";

export default function AuthRoutesLayout() {
  // No auth check here - let individual pages handle redirects
  // This prevents interference with social login navigation
  return <Stack screenOptions={{ headerShown: false }} />;
}
