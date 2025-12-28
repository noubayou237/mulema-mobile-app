import "dotenv/config";

export default {
  expo: {
    name: "frontend",          // nom affiché (tu peux changer)
    slug: "frontend",          // identifiant technique (minuscules, sans espaces)
    scheme: "frontend",        // scheme pour les deep links (frontend://...)
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },

    // Identifiants pour build (remplace par les tiens avant build)
    android: {
      package: "com.yourcompany.frontend", // change par ton package unique
    },
    ios: {
      bundleIdentifier: "com.yourcompany.frontend", // change par ton bundle id
    },

    // Configuration optionnelle de linking (utile pour React Navigation / Expo Router)
    // Les "prefixes" couvrent : scheme custom + (facultatif) un domaine https
    linking: {
      prefixes: ["frontend://", "https://frontend.example.com"],
      config: {
        screens: {
          // adapte les routes aux fichiers de ton dossier `app/`
          // ex: app/sign-in.tsx -> route "sign-in"
          signIn: "sign-in",
          signUp: "sign-up",
          home: "home",
          // si tu as un écran de verification d'email :
          verifyEmail: "verify-email",
          // ou une route dynamique : user/[id].tsx -> "user/:id"
          // user: "user/:id",
        },
      },
    },
  },
};
