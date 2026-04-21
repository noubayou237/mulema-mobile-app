import { z } from "zod";

// Define the schema for environment variables
// Using optional() to handle missing environment variables gracefully
const envSchema = z.object({
  // API Configuration
  EXPO_PUBLIC_API_IP: z.string().optional(),

  // Google OAuth - All client IDs are optional but warn if missing
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().optional(),

  // Facebook OAuth
  EXPO_PUBLIC_FACEBOOK_APP_ID: z.string().optional(),

  // Expo credentials (for social login redirect URIs)
  EXPO_PUBLIC_EXPO_USERNAME: z.string().optional(),
  EXPO_PUBLIC_APP_SLUG: z.string().optional()
});

// Parse and validate process.env against the schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  console.warn("⚠️ Using default values for missing environment variables.");
}

// Extract data with defaults for any missing values
const envData = _env.data || {};

// Export the validated environment variables with fallback defaults
export const env = {
  EXPO_PUBLIC_API_IP: envData.EXPO_PUBLIC_API_IP || "localhost",
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: envData.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
    envData.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "",
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID:
    envData.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "",
  EXPO_PUBLIC_FACEBOOK_APP_ID: envData.EXPO_PUBLIC_FACEBOOK_APP_ID || "",
  EXPO_PUBLIC_EXPO_USERNAME: envData.EXPO_PUBLIC_EXPO_USERNAME || "",
  EXPO_PUBLIC_APP_SLUG: envData.EXPO_PUBLIC_APP_SLUG || "mulema"
};

// Type for TypeScript autocomplete
export type Env = z.infer<typeof envSchema>;
