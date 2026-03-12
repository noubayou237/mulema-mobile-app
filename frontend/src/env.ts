import { z } from "zod";

// Define the schema for environment variables
const envSchema = z.object({
  // API Configuration
  EXPO_PUBLIC_API_IP: z.string().min(1),

  // Google OAuth - All client IDs are required
  EXPO_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().min(1),
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: z.string().min(1),

  // Facebook OAuth
  EXPO_PUBLIC_FACEBOOK_APP_ID: z.string().min(1)
});

// Parse and validate process.env against the schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error(
    "Invalid environment variables. Please check your .env file."
  );
}

// Export the validated environment variables
export const env = _env.data;

// Type for TypeScript autocomplete
export type Env = z.infer<typeof envSchema>;
