import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Image,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

// Design tokens
const COLORS = {
  primary: "#D32F2F",
  background: "#F9F5F5",
  card: "#FFFFFF",
  foreground: "#050303",
  border: "#F3E8E8",
  muted: "#6B6B6B"
};

const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

const UserAvatar = ({ source, size = 40 }) => {
  if (source) {
    return (
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarPlaceholder,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    >
      <Feather name='user' size={size * 0.6} color='#666' />
    </View>
  );
};

export default function Community() {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_FADE_END / 2, HEADER_SCROLL_FADE_END],
    outputRange: [0, 1],
    extrapolate: "clamp"
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_FADE_END / 2],
    outputRange: [1, 0],
    extrapolate: "clamp"
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />

      {/* Header flottant */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>{t("nav.community")}</Text>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Grand titre */}
        <Animated.View style={{ opacity: largeTitleOpacity }}>
          <Text style={styles.mainTitle}>{t("nav.community")}</Text>

          <Text style={styles.subtitle}>{t("community.subtitle")}</Text>
        </Animated.View>

        {/* Section leaderboard card */}
        <View style={styles.leaderboardCard}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>

          <View style={styles.leaderboardList}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.leaderboardItem}>
                <UserAvatar size={32} />
                <Text style={styles.leaderboardName}>User {item}</Text>
                <Text style={styles.leaderboardPoints}>
                  {100 - item * 5} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity feed */}
        <Text style={styles.activityTitle}>{t("community.activityFeed")}</Text>

        <View style={styles.activityList}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.activityItem}>
              <UserAvatar />
              <Text style={styles.activityText}>
                <Text style={styles.activityBold}>User {item}</Text> completed a
                lesson 🔥
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/standalone/stats")}
          style={styles.statsButton}
        >
          <Text style={styles.statsButtonText}>{t("community.viewStats")}</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  smallHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  smallHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.primary
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: HEADER_MIN_HEIGHT + 10,
    paddingBottom: 100
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 32
  },
  subtitle: {
    color: COLORS.muted,
    marginBottom: 24
  },
  leaderboardCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  leaderboardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.foreground,
    marginBottom: 16
  },
  leaderboardList: {
    gap: 16
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center"
  },
  leaderboardName: {
    flex: 1,
    color: COLORS.foreground,
    fontWeight: "500",
    marginLeft: 12
  },
  leaderboardPoints: {
    color: COLORS.primary,
    fontWeight: "bold"
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.foreground,
    marginBottom: 16
  },
  activityList: {
    gap: 16
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activityText: {
    flex: 1,
    color: COLORS.foreground,
    marginLeft: 12
  },
  activityBold: {
    fontWeight: "bold"
  },
  statsButton: {
    marginTop: 32,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center"
  },
  statsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center"
  }
});
