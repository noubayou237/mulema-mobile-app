import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useUser();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("../../assets/images/avatar-user.png")}
              style={styles.avatar}
              contentFit='cover'
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user?.username || "User"}</Text>
            <Text style={styles.email}>{user?.email || ""}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
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
    marginRight: 20
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  userInfo: {
    justifyContent: "center"
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
  }
});

export default Profile;
