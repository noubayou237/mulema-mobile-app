import React, { useState } from "react";
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../src/context/UserContext";
import { useTranslation } from "react-i18next";
import {
  useGoogleLogin,
  useFacebookLogin,
  useAppleLogin
} from "../../src/hooks/useSocialLogin";

import ScreenWrapper from "../components/ui/ScreenWrapper";
import AppTitle from "../components/ui/AppTitle";
import AppText from "../components/ui/AppText";
import AuthInput from "../components/ui/AuthInput";
import Button from "../components/ui/Button";

export default function SignInScreen() {
  const router = useRouter();
  const { login, setUserData } = useUser();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Social login hooks
  const googleLogin = useGoogleLogin();
  const facebookLogin = useFacebookLogin();
  const appleLogin = useAppleLogin();

  const handleSignIn = async () => {
    if (!email || !password) {
      return Alert.alert(t("common.error"), t("errors.requiredField"));
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Sign in failed.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const result = await googleLogin.signIn();
    if (result.success) {
      // Update UserContext with user data from backend
      if (result.user) {
        setUserData(result.user);
      }
      if (result.isNewUser) {
        router.replace("/ChoiceLanguage");
      } else {
        router.replace("/(tabs)/home");
      }
    } else if (result.error && result.error !== "Cancelled") {
      Alert.alert("Google Login Failed", result.error);
    }
  };

  const handleFacebookLogin = async () => {
    const result = await facebookLogin.signIn();
    if (result.success) {
      // Update UserContext with user data from backend
      if (result.user) {
        setUserData(result.user);
      }
      if (result.isNewUser) {
        router.replace("/ChoiceLanguage");
      } else {
        router.replace("/(tabs)/home");
      }
    } else if (result.error && result.error !== "Cancelled") {
      Alert.alert("Facebook Login Failed", result.error);
    }
  };

  const handleAppleLogin = async () => {
    if (!appleLogin.isAvailable) {
      Alert.alert(
        "Apple Sign-In Unavailable",
        "Apple Sign-In is not available on this device."
      );
      return;
    }

    const result = await appleLogin.signIn();
    if (result.success) {
      // Update UserContext with user data from backend
      if (result.user) {
        setUserData(result.user);
      }
      if (result.isNewUser) {
        router.replace("/ChoiceLanguage");
      } else {
        router.replace("/(tabs)/home");
      }
    } else if (result.error && result.error !== "Cancelled") {
      Alert.alert("Apple Login Failed", result.error);
    }
  };

  const onForgotPassword = () => {
    if (!email || !email.includes("@")) {
      return Alert.alert("Invalid Email", "Enter a valid email first.");
    }

    router.push({
      pathname: "/(auth)/ResetPasswordScreen",
      params: { email }
    });
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className='flex-1'
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className='items-center mb-8'>
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 100, height: 100 }}
              contentFit='contain'
            />
          </View>

          {/* Title */}
          <AppTitle className='mb-6'>{t("auth.welcomeBack")}</AppTitle>

          {/* Form */}
          <View>
            <AuthInput
              label='Email'
              placeholder='Enter email'
              value={email}
              onChangeText={setEmail}
              keyboardType='email-address'
            />

            <View className='relative'>
              <AuthInput
                label='Password'
                placeholder='Enter password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className='absolute right-4 top-10'
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color='#6B7280'
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={onForgotPassword}
              className='items-end mb-4'
            >
              <AppText variant='muted' className='underline'>
                Forgot password?
              </AppText>
            </TouchableOpacity>

            {/* Button */}
            <Button title='Sign In' onPress={handleSignIn} loading={loading} />

            {/* Divider */}
            <View className='flex-row items-center my-6'>
              <View className='flex-1 h-px bg-gray-300' />
              <AppText variant='muted' className='mx-4'>
                or
              </AppText>
              <View className='flex-1 h-px bg-gray-300' />
            </View>

            {/* Social Login Buttons */}
            <View className='gap-3'>
              {/* Google */}
              <TouchableOpacity
                onPress={handleGoogleLogin}
                disabled={googleLogin.loading || !googleLogin}
                className='flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3 px-4'
              >
                {googleLogin.loading ? (
                  <Ionicons name='hourglass' size={20} color='#666' />
                ) : (
                  <>
                    <Ionicons
                      name='logo-google'
                      size={20}
                      color='#666'
                      style={{ marginRight: 10 }}
                    />
                    <AppText className='text-gray-700 font-medium'>
                      Continue with Google
                    </AppText>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                onPress={handleFacebookLogin}
                disabled={facebookLogin.loading}
                className='flex-row items-center justify-center bg-[#1877F2] border border-[#1877F2] rounded-xl py-3 px-4'
              >
                {facebookLogin.loading ? (
                  <Ionicons name='hourglass' size={20} color='white' />
                ) : (
                  <>
                    <Ionicons
                      name='logo-facebook'
                      size={20}
                      color='white'
                      style={{ marginRight: 10 }}
                    />
                    <AppText className='text-white font-medium'>
                      Continue with Facebook
                    </AppText>
                  </>
                )}
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                onPress={handleAppleLogin}
                disabled={appleLogin.loading}
                className='flex-row items-center justify-center bg-black border border-black rounded-xl py-3 px-4'
              >
                {appleLogin.loading ? (
                  <Ionicons name='hourglass' size={20} color='white' />
                ) : (
                  <>
                    <Ionicons
                      name='logo-apple'
                      size={20}
                      color='white'
                      style={{ marginRight: 10 }}
                    />
                    <AppText className='text-white font-medium'>
                      Continue with Apple
                    </AppText>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up */}
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-up")}
              className='mt-6 items-center'
            >
              <AppText variant='muted'>
                Don&apos;t have an account?{" "}
                <AppText className='text-primary'>Sign up</AppText>
              </AppText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
