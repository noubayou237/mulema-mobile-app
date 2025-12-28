import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";

import { useSignUp } from "@clerk/clerk-expo";
import { authStyles } from "../../assets/styles/auth.styles";


const VerifyEmailScreen = () => {
  const { isLoaded, signUp } = useSignUp();
  // const params = useSearchParams();
  const params = useLocalSearchParams();

  const router = useRouter();
  const [code, setCode] = useState("");
  const email = params?.email || "";

  const handleVerify = async () => {
    if (!code.trim()) return Alert.alert("Erreur", "Entre le code reçu par email.");

    if (!isLoaded || !signUp) {
      return Alert.alert("Erreur", "Service d'authentification non prêt.");
    }

    try {
      // attempt verification with Clerk
      // NOTE: API name may vary selon version Clerk — adapt si besoin
      await signUp.attemptEmailAddressVerification({ code });
      // une fois vérifié, Clerk devrait créer la session / utilisateur selon ta configuration
      Alert.alert("Succès", "Email vérifié — connexion en cours...");
      router.push("/home"); // redirige vers ton écran principal
    } catch (err) {
      console.error("Verify error:", err);
      const message = err?.message || "Échec de la vérification.";
      Alert.alert("Erreur", message);
    }
  };

  const resend = async () => {
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      Alert.alert("Envoyé", `Un nouveau code a été envoyé à ${email}`);
    } catch (e) {
      console.warn("Resend failed:", e);
      Alert.alert("Erreur", "Impossible de renvoyer le code pour le moment.");
    }
  };

  return (

    <View style={authStyles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={authStyles.keyboardView} keyboardVerticalOffset={64}>
          <ScrollView contentContainerStyle={authStyles.scrollContent}>
           <View style={authStyles.container}>

       <View style={authStyles.imageContainer}>
          <Image source={require("../../assets/images/otp.png")} style={authStyles.image} contentFit="contain" />
        </View>
      <Text style={authStyles.title}>Vérifier l'email</Text>
      <Text style={{ marginBottom: 12 }}>Code envoyé à: {email}</Text>

      <TextInput
        style={authStyles.textInput}
        placeholder="Entrez le code"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TouchableOpacity style={authStyles.authButton} onPress={handleVerify}>
        <Text style={authStyles.buttonText}>Vérifier</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resend} style={{ marginTop: 10 }}>
        <Text style={authStyles.link}>Renvoyer le code</Text>
      </TouchableOpacity>
      <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.push("/sign-up")}>
                <Text style={authStyles.linkText}>
                  Back to <Text style={authStyles.link}>Sign up</Text>
                </Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
    </View>
   
  );
};

export default VerifyEmailScreen;
