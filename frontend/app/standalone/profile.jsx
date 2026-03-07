import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import api from "@/services/api";
import { useTranslation } from "react-i18next";
import "../../src/i18n";

// Language options with flags
const LANGUAGES = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸"
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷"
  }
];

const Profile = () => {
  const router = useRouter();
  const { user, logout, refreshUser, setLanguage } = useUser();
  const { t, i18n } = useTranslation();

  // Get current language from i18n for display
  const currentLanguage = i18n.language || "fr";

  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  // Language modal state
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  // Load user profile data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    // Skip if no user is logged in
    if (!user) {
      return;
    }

    try {
      const response = await api.get("/user/profile");
      if (response.data.avatar?.imageUrl) {
        // Get the image URL
        let imageUrl = response.data.avatar.imageUrl;

        // Handle different URL formats - use proxy endpoint for R2 images
        let fullImageUrl;
        if (
          imageUrl.includes("r2.cloudflarestorage.com") ||
          imageUrl.includes("public.r2")
        ) {
          // Extract the key from R2 URL and use proxy endpoint
          const key = imageUrl.split("/").pop().split("?")[0];
          fullImageUrl = `http://192.168.43.125:5001/image/avatars/${key}`;
        } else if (imageUrl.startsWith("http")) {
          // Already a full URL (R2 or other CDN)
          fullImageUrl = imageUrl;
        } else if (imageUrl.startsWith("/")) {
          // Relative path - prepend API URL
          fullImageUrl = `http://192.168.43.125:5001${imageUrl}`;
        } else {
          // Just filename - construct full path
          fullImageUrl = `http://192.168.43.125:5001/uploads/avatars/${imageUrl}`;
        }

        // Add cache busting parameter
        const separator = fullImageUrl.includes("?") ? "&" : "?";
        fullImageUrl = `${fullImageUrl}${separator}t=${Date.now()}`;

        setProfileImage(fullImageUrl);
      }
    } catch (error) {
      console.log("Error loading profile:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Profile: Starting logout...");
      await logout();
      console.log("Profile: Logout completed, redirecting...");
      router.replace("/sign-in");
    } catch (err) {
      console.error("Profile logout error:", err);
      Alert.alert("Error", "Failed to logout. Please try again.");
    }
  };

  // =====================
  // LANGUAGE FUNCTIONS
  // =====================
  const handleLanguageChange = async (langCode) => {
    setIsChangingLanguage(true);
    try {
      await setLanguage(langCode);
      setShowLanguageModal(false);
      Alert.alert(t("messages.languageChanged"), "");
    } catch (error) {
      console.error("Error changing language:", error);
      Alert.alert(t("errors.somethingWentWrong"), "");
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const getCurrentLanguageInfo = () => {
    return (
      LANGUAGES.find((lang) => lang.code === currentLanguage) || LANGUAGES[0]
    );
  };

  // =====================
  // IMAGE PICKER FUNCTIONS
  // =====================
  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || mediaStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and media library permissions to upload profile pictures."
      );
      return false;
    }
    return true;
  };

  const openImagePicker = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setShowImagePicker(false);

    Alert.alert("Select Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: () => launchCamera()
      },
      {
        text: "Choose from Gallery",
        onPress: () => launchImageLibrary()
      },
      {
        text: "Cancel",
        style: "cancel"
      }
    ]);
  };

  const launchCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const launchImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // =====================
  // UPLOAD FUNCTIONS
  // =====================
  const uploadProfilePicture = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "No image selected");
      return;
    }

    setIsUploading(true);

    try {
      // Create form data
      const formData = new FormData();

      // Get the file extension
      const uri = selectedImage.uri;
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // Append the file
      formData.append("file", {
        uri,
        name: filename || "photo.jpg",
        type
      });

      console.log("Uploading profile picture...");

      const response = await api.put("/user/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        timeout: 30000 // 30 seconds timeout
      });

      console.log("Upload response:", response.data);

      if (response.data.imageUrl) {
        // Update local state with the new image URL
        let uploadedUrl = response.data.imageUrl;

        // Use proxy endpoint for R2 images
        if (
          uploadedUrl.includes("r2.cloudflarestorage.com") ||
          uploadedUrl.includes("public.r2")
        ) {
          // Extract the key from R2 URL and use proxy endpoint
          const key = uploadedUrl.split("/").pop().split("?")[0];
          uploadedUrl = `http://192.168.43.125:5001/image/avatars/${key}`;
        } else if (uploadedUrl.startsWith("http")) {
          // Already a full URL (R2 or other CDN)
        } else if (uploadedUrl.startsWith("/")) {
          // Relative path - prepend API URL
          uploadedUrl = `http://192.168.43.125:5001${uploadedUrl}`;
        } else {
          // Just filename - construct full path
          uploadedUrl = `http://192.168.43.125:5001/uploads/avatars/${uploadedUrl}`;
        }

        // Add cache busting parameter
        const separator = uploadedUrl.includes("?") ? "&" : "?";
        const fullImageUrl = `${uploadedUrl}${separator}t=${Date.now()}`;
        setProfileImage(fullImageUrl);

        Alert.alert(t("profile.profilePictureUpdated"), "");
      }

      setShowPreview(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload image";
      Alert.alert(t("errors.uploadFailed"), errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setShowPreview(false);
    setSelectedImage(null);
  };

  // =====================
  // EDIT PROFILE FUNCTIONS
  // =====================
  const openEditModal = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setShowEditModal(true);
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    if (!editEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsSaving(true);

    try {
      const response = await api.put("/user/profile", {
        name: editName.trim(),
        email: editEmail.trim()
      });

      // Refresh user context
      await refreshUser();

      setShowEditModal(false);
      Alert.alert(t("profile.profileUpdated"), "");
    } catch (error) {
      console.error("Update profile error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      Alert.alert("Update Failed", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Get image source for display
  const getImageSource = () => {
    if (profileImage) {
      return { uri: profileImage };
    }
    return require("../../assets/images/avatar-user.png");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t("profile.title")}</Text>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={getImageSource()}
                style={styles.avatar}
                contentFit='cover'
              />
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={openImagePicker}
              >
                <Ionicons name='camera' size={20} color='#fff' />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user?.username || "User"}</Text>
              <Text style={styles.email}>{user?.email || ""}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{user?.totalPrawns || 0}</Text>
              <Text style={styles.statLabel}>{t("profile.points")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>{t("profile.completed")}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>{t("profile.rank")}</Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='person-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>
                  {t("profile.editProfile")}
                </Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            {/* Language Selector */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowLanguageModal(true)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name='language-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>
                  {t("settings.language")}
                </Text>
              </View>
              <View style={styles.languageSelector}>
                <Text style={styles.currentLanguageText}>
                  {getCurrentLanguageInfo().flag}{" "}
                  {getCurrentLanguageInfo().name}
                </Text>
                <Ionicons
                  name='chevron-forward-outline'
                  size={20}
                  color='#ccc'
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='notifications-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>
                  {t("settings.notifications")}
                </Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='settings-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>{t("settings.title")}</Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='help-circle-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>
                  {t("settings.helpSupport")}
                </Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='log-out-outline' size={24} color='#d9534f' />
                <Text style={[styles.menuItemText, { color: "#d9534f" }]}>
                  {t("profile.logout")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={showPreview}
        transparent
        animationType='fade'
        onRequestClose={cancelUpload}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.previewModalContent}>
            <Text style={styles.previewTitle}>Preview</Text>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                contentFit='cover'
              />
            )}

            <View style={styles.previewButtons}>
              <TouchableOpacity
                style={[styles.previewButton, styles.cancelButton]}
                onPress={cancelUpload}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.previewButton, styles.uploadButton]}
                onPress={uploadProfilePicture}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color='#fff' size='small' />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>
                {t("profile.editProfile")}
              </Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("profile.name")}</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder='Enter your name'
                placeholderTextColor='#999'
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("profile.email")}</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder='Enter your email'
                placeholderTextColor='#999'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color='#fff' size='small' />
              ) : (
                <Text style={styles.saveButtonText}>{t("common.save")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType='slide'
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalContent}>
            <View style={styles.languageModalHeader}>
              <Text style={styles.languageModalTitle}>
                {t("settings.selectLanguage")}
              </Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>

            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  currentLanguage === lang.code && styles.languageOptionSelected
                ]}
                onPress={() => handleLanguageChange(lang.code)}
                disabled={isChangingLanguage}
              >
                <View style={styles.languageOptionContent}>
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      currentLanguage === lang.code &&
                        styles.languageNameSelected
                    ]}
                  >
                    {lang.name}
                  </Text>
                </View>
                {currentLanguage === lang.code && (
                  <Ionicons name='checkmark-circle' size={24} color='#4CAF50' />
                )}
              </TouchableOpacity>
            ))}

            {isChangingLanguage && (
              <ActivityIndicator
                color='#4CAF50'
                size='small'
                style={styles.languageLoader}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  scrollView: {
    flex: 1
  },
  content: {
    flex: 1,
    padding: 20
  },
  header: {
    marginBottom: 30
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333"
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  avatarContainer: {
    position: "relative"
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff"
  },
  userInfo: {
    justifyContent: "center",
    marginLeft: 20,
    flex: 1
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333"
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 5
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30
  },
  statBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50"
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 5
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15
  },
  languageSelector: {
    flexDirection: "row",
    alignItems: "center"
  },
  currentLanguageText: {
    fontSize: 14,
    color: "#666",
    marginRight: 5
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center"
  },

  // Preview Modal
  previewModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxWidth: 400,
    alignItems: "center"
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10
  },
  previewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5
  },
  cancelButton: {
    backgroundColor: "#e0e0e0"
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600"
  },
  uploadButton: {
    backgroundColor: "#4CAF50"
  },
  uploadButtonText: {
    color: "#fff",
    fontWeight: "600"
  },

  // Edit Modal
  editModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  inputContainer: {
    marginBottom: 15
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: "#333"
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },

  // Language Modal
  languageModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400
  },
  languageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333"
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f5f5f5"
  },
  languageOptionSelected: {
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#4CAF50"
  },
  languageOptionContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 15
  },
  languageName: {
    fontSize: 16,
    color: "#333"
  },
  languageNameSelected: {
    fontWeight: "600",
    color: "#4CAF50"
  },
  languageLoader: {
    marginTop: 10
  }
});

export default Profile;
