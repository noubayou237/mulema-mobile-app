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
import api from "../../services/api";
import { Platform as PlatformEnv } from "react-native";

const Profile = () => {
  const router = useRouter();
  const { user, logout, refreshUser } = useUser();

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

  // Load user profile data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await api.get("/user/profile");
      if (response.data.avatar?.imageUrl) {
        // Get the API base URL for the image
        const imageUrl = response.data.avatar.imageUrl;
        // Prepend the API URL if it's a relative path
        const fullImageUrl = imageUrl.startsWith("http")
          ? imageUrl
          : `http://192.168.43.125:5001${imageUrl}`;
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

    setShowImagePicker(true);
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
        const fullImageUrl = response.data.imageUrl.startsWith("http")
          ? response.data.imageUrl
          : `http://192.168.43.125:5001${response.data.imageUrl}`;
        setProfileImage(fullImageUrl);

        Alert.alert("Success", "Profile picture updated successfully!");
      }

      setShowPreview(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to upload image";
      Alert.alert("Upload Failed", errorMessage);
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
      Alert.alert("Success", "Profile updated successfully!");
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
            <Text style={styles.headerTitle}>Profile</Text>
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
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>-</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='person-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='notifications-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='settings-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>Settings</Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='help-circle-outline' size={24} color='#333' />
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name='chevron-forward-outline' size={20} color='#ccc' />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <View style={styles.menuItemLeft}>
                <Ionicons name='log-out-outline' size={24} color='#d9534f' />
                <Text style={[styles.menuItemText, { color: "#d9534f" }]}>
                  Logout
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
                <Text style={styles.cancelButtonText}>Cancel</Text>
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
              <Text style={styles.editModalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name='close' size={24} color='#333' />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder='Enter your name'
                placeholderTextColor='#999'
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
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
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        transparent
        animationType='slide'
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePickerModalContent}>
            <Text style={styles.imagePickerTitle}>Select Profile Picture</Text>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => {
                setShowImagePicker(false);
                launchCamera();
              }}
            >
              <Ionicons name='camera' size={24} color='#007AFF' />
              <Text style={styles.imagePickerOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.imagePickerOption}
              onPress={() => {
                setShowImagePicker(false);
                launchImageLibrary();
              }}
            >
              <Ionicons name='images' size={24} color='#007AFF' />
              <Text style={styles.imagePickerOptionText}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imagePickerOption, styles.imagePickerCancel]}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.imagePickerCancelText}>Cancel</Text>
            </TouchableOpacity>
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
  // Image Picker Modal Styles
  imagePickerModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    alignItems: "center"
  },
  imagePickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20
  },
  imagePickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  imagePickerOptionText: {
    fontSize: 16,
    color: "#007AFF",
    marginLeft: 15
  },
  imagePickerCancel: {
    borderBottomWidth: 0,
    marginTop: 10,
    justifyContent: "center"
  },
  imagePickerCancelText: {
    fontSize: 16,
    color: "#999"
  }
});

export default Profile;
