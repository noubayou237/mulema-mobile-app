export default {
  expo: {
    name: "Mulema",
    slug: "mulema",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mulema",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/34e3ccd6-55a9-4abe-9cbd-de8441d88ad3"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    extra: {
      apiIp: process.env.EXPO_PUBLIC_API_IP,
      eas: {
        projectId: "34e3ccd6-55a9-4abe-9cbd-de8441d88ad3"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mulema.app",
      infoPlist: {
        NSFaceIDUsageDescription: "Use Face ID for authentication"
      }
    },
    android: {
      package: "com.mulema.app",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    linking: {
      prefixes: ["mulema://", "https://mulema.example.com"],
      config: {
        screens: {
          signIn: "sign-in",
          signUp: "sign-up",
          home: "home",
          verifyEmail: "verify-email"
        }
      }
    }
  }
};
