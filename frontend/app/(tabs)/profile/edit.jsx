import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

import { Colors, Typo, Space, Radius, Shadow } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/useAuthStore";

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateProfile, updateProfilePicture } = useAuthStore();

  const [name, setName] = useState(user?.name || "");
  const [avatarUri, setAvatarUri] = useState(user?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("common.error"),
        t("errors.cameraPermission", "Permissions are required to access the gallery.")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Correct usage for SDK 50+
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedUri = result.assets[0].uri;
      setAvatarUri(selectedUri);
      
      // Upload immediately
      setIsUploading(true);
      try {
        const fileExt = selectedUri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = ['png', 'gif', 'webp'].includes(fileExt) 
          ? `image/${fileExt}` 
          : 'image/jpeg';
          
        await updateProfilePicture(selectedUri, mimeType, `avatar.${fileExt}`);
        Alert.alert(t("common.success"), t("profile.avatarUpdated", "Avatar was updated successfully."));
      } catch (err) {
        console.warn("Avatar upload error", err);
        Alert.alert(t("common.error"), t("errors.uploadFailed", "Failed to upload avatar."));
        setAvatarUri(user?.avatar || null); // Revert
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t("common.error"), t("errors.nameRequired", "Name is required."));
      return;
    }

    setIsSaving(true);
    try {
      if (name.trim() !== user?.name) {
        await updateProfile(name.trim());
      }
      
      router.back();
    } catch (err) {
      console.warn("Profile update error", err);
      Alert.alert(t("common.error"), t("errors.updateFailed", "Failed to update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={s.root}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.onSurface} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{t("profile.editProfile", "Edit Profile")}</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={s.content}>
            {/* Avatar Section */}
            <View style={s.avatarContainer}>
              <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
                <View style={[s.avatarRing, Shadow.sm]}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={s.avatar} contentFit="cover" />
                  ) : (
                    <View style={[s.avatar, { backgroundColor: Colors.primary + "15", alignItems: "center", justifyContent: "center" }]}>
                      <Ionicons name="person" size={48} color={Colors.primary} />
                    </View>
                  )}
                  {isUploading && (
                    <View style={s.uploadingOverlay}>
                      <ActivityIndicator color="#FFF" />
                    </View>
                  )}
                  <View style={s.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={s.avatarHint}>{t("profile.tapToChange", "Tap to change picture")}</Text>
            </View>

            {/* Form Section */}
            <Text style={s.label}>{t("auth.name", "Full Name")}</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.textTertiary} style={s.inputIcon} />
              <TextInput
                value={name}
                onChangeText={setName}
                style={s.input}
                placeholder={t("auth.namePlaceholder", "Your Name")}
                placeholderTextColor={Colors.textFaint}
              />
            </View>

            <Text style={[s.label, { marginTop: Space.xl }]}>{t("auth.email", "Email Address")}</Text>
            <View style={[s.inputWrapper, { backgroundColor: Colors.surfaceVariant + "40" }]}>
              <Ionicons name="mail-outline" size={20} color={Colors.textTertiary} style={s.inputIcon} />
              <TextInput
                value={user?.email || ""}
                style={[s.input, { color: Colors.textSecondary }]}
                editable={false}
              />
            </View>
            <Text style={s.inputHint}>{t("profile.emailFixedHint", "Email address cannot be changed here.")}</Text>
            
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <TouchableOpacity 
              style={[s.saveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={s.saveBtnText}>{t("common.save", "Save Changes")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 60 : 44, paddingBottom: Space.lg,
    paddingHorizontal: Space["2xl"], borderBottomWidth: 1, borderColor: Colors.border,
  },
  headerTitle: { ...Typo.titleMd, color: Colors.onSurface },
  closeBtn: { width: 44, height: 44, justifyContent: "center" },
  content: { flex: 1, padding: Space["2xl"] },
  
  avatarContainer: { alignItems: "center", marginBottom: 40 },
  avatarRing: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.surfaceContainerLowest,
    justifyContent: "center", alignItems: "center",
    marginBottom: Space.sm,
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 60,
    justifyContent: "center", alignItems: "center",
  },
  cameraBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: Colors.surfaceContainerLowest,
  },
  avatarHint: { ...Typo.labelSm, color: Colors.textTertiary, marginTop: Space.sm },

  label: { ...Typo.labelLg, color: Colors.onSurface, marginBottom: Space.sm, marginLeft: Space.xs },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.lg, height: 56, paddingHorizontal: Space.lg,
  },
  inputIcon: { marginRight: Space.md },
  input: { flex: 1, ...Typo.bodyLg, color: Colors.onSurface, height: "100%" },
  inputHint: { ...Typo.bodySm, color: Colors.textTertiary, marginTop: Space.xs, marginLeft: Space.xs },

  footer: {
    padding: Space["2xl"], paddingBottom: Platform.OS === "ios" ? 40 : Space["2xl"],
    borderTopWidth: 1, borderColor: Colors.border,
  },
  saveBtn: {
    height: 56, backgroundColor: Colors.primary,
    borderRadius: Radius.full, justifyContent: "center", alignItems: "center",
  },
  saveBtnText: { ...Typo.titleSm, color: "#fff" },
});
