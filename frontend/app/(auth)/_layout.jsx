import { Redirect, Stack } from "expo-router";
import { useUser } from "../../src/context/UserContext";

export default function AuthRoutesLayout() {
  const { user, isLoading } = useUser();

  // If user is logged in, redirect to home
  if (!isLoading && user) {
    return <Redirect href={"/(tabs)/home"} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
