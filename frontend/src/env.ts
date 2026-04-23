import { z } from "zod";

const envSchema = z.object({
  // Production API endpoint — takes priority over EXPO_PUBLIC_API_IP in api.js
  EXPO_PUBLIC_API_URL: z.string().url().optional(),

  // Dev-only: local machine IP for connecting a physical device to a local server
  EXPO_PUBLIC_API_IP: z.string().optional(),

  // Google OAuth (required only when social login is enabled)
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),

  // Facebook OAuth
  EXPO_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),

  // Expo credentials (for social login redirect URIs)
  EXPO_PUBLIC_EXPO_USERNAME: z.string().optional(),
  EXPO_PUBLIC_APP_SLUG: z.string().optional(),

  // App links
  EXPO_PUBLIC_PRIVACY_POLICY_URL: z.string().url().optional(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // Invalid values (e.g. malformed URL) — log details so they're easy to spot
  console.error("[env] Invalid environment variables:", _env.error.format());
}

const envData = _env.data ?? {};

// In development, warn when no API endpoint is explicitly configured so
// developers notice they are hitting the built-in fallback rather than their
// intended server.
if (__DEV__ && !envData.EXPO_PUBLIC_API_URL && !envData.EXPO_PUBLIC_API_IP) {
  console.warn(
    "[env] Neither EXPO_PUBLIC_API_URL nor EXPO_PUBLIC_API_IP is set. " +
    "The app will fall back to auto-detected localhost. " +
    "Set one of these in your .env file to connect to a specific server."
  );
}

export const env = {
  EXPO_PUBLIC_API_URL: envData.EXPO_PUBLIC_API_URL ?? "",
  EXPO_PUBLIC_API_IP: envData.EXPO_PUBLIC_API_IP ?? "localhost",
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: envData.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: envData.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: envData.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
  EXPO_PUBLIC_FACEBOOK_APP_ID: envData.EXPO_PUBLIC_FACEBOOK_APP_ID ?? "",
  EXPO_PUBLIC_EXPO_USERNAME: envData.EXPO_PUBLIC_EXPO_USERNAME ?? "",
  EXPO_PUBLIC_APP_SLUG: envData.EXPO_PUBLIC_APP_SLUG ?? "mulema",
  EXPO_PUBLIC_PRIVACY_POLICY_URL: envData.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "",
};

export type Env = z.infer<typeof envSchema>;
