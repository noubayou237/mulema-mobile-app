// app/(tabs)/index.jsx
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_SESSION_KEY = "userSession"; // doit correspondre à la clé utilisée par ton UserContext

export default function IndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const session = await AsyncStorage.getItem(USER_SESSION_KEY);

        if (!mounted) return;

        if (session) {
          // Session active -> on laisse Splash décider du flux (ChoiceLanguage / intro / home)
          router.replace("/splash");
        } else {
          // Pas de session -> aller à l'écran d'auth (adapte la route si nécessaire)
          router.replace("/sign-in");
        }
      } catch (err) {
        console.warn("IndexRedirect: erreur lecture session", err);
        // En cas d'erreur, router vers l'auth par sécurité
        router.replace("/sign-in");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return null;
}
