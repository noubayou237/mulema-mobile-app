import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
<<<<<<< HEAD
  Image,
  StyleSheet
=======
  Image
>>>>>>> feat/settings-page
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

<<<<<<< HEAD
// Design tokens
const COLORS = {
  primary: "#D32F2F",
  background: "#F9F5F5",
  card: "#FFFFFF",
  foreground: "#050303",
  border: "#F3E8E8",
  muted: "#6B6B6B"
};

=======
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
      style={[
        styles.avatarPlaceholder,
        { width: size, height: size, borderRadius: size / 2 }
      ]}
    >
      <Feather name='user' size={size * 0.6} color='#666' />
=======
      className="bg-muted items-center justify-center"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Feather name="user" size={size * 0.6} color="#666" />
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
=======
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
>>>>>>> feat/settings-page

      {/* Header flottant */}
      <Animated.View
        style={{ opacity: smallHeaderOpacity }}
        className="absolute top-0 left-0 right-0 h-10 bg-background border-b border-border items-center justify-center z-10"
      >
        <Text className="text-base font-bold text-primary">
          {t("nav.community")}
        </Text>
      </Animated.View>

      <Animated.ScrollView
<<<<<<< HEAD
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
=======
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: HEADER_MIN_HEIGHT + 10,
          paddingBottom: 40
        }}
>>>>>>> feat/settings-page
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Grand titre */}
        <Animated.View style={{ opacity: largeTitleOpacity }}>
<<<<<<< HEAD
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
=======
          <Text className="text-3xl font-bold text-primary mb-2">
            {t("nav.community")}
          </Text>

          <Text className="text-muted-foreground mb-6">
            {t("community.subtitle")}
          </Text>
        </Animated.View>

        {/* Section leaderboard card */}
        <View className="bg-card rounded-2xl p-4 mb-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Leaderboard
          </Text>

          <View className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                className="flex-row items-center"
              >
                <UserAvatar size={32} />
                <Text className="ml-3 flex-1 text-foreground font-medium">
                  User {item}
                </Text>
                <Text className="text-primary font-bold">
>>>>>>> feat/settings-page
                  {100 - item * 5} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity feed */}
<<<<<<< HEAD
        <Text style={styles.activityTitle}>{t("community.activityFeed")}</Text>

        <View style={styles.activityList}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.activityItem}>
              <UserAvatar />
              <Text style={styles.activityText}>
                <Text style={styles.activityBold}>User {item}</Text> completed a
                lesson 🔥
=======
        <Text className="text-lg font-semibold text-foreground mb-4">
          {t("community.activityFeed")}
        </Text>

        <View className="space-y-4">
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              className="flex-row items-center bg-card p-4 rounded-xl border border-border"
            >
              <UserAvatar />
              <Text className="ml-3 flex-1 text-foreground">
                <Text className="font-bold">User {item}</Text>{" "}
                completed a lesson 🔥
>>>>>>> feat/settings-page
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/standalone/stats")}
<<<<<<< HEAD
          style={styles.statsButton}
        >
          <Text style={styles.statsButtonText}>{t("community.viewStats")}</Text>
=======
          className="mt-8 bg-primary py-4 rounded-full items-center"
        >
          <Text className="text-primary-foreground font-semibold">
            {t("community.viewStats")}
          </Text>
>>>>>>> feat/settings-page
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
<<<<<<< HEAD
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
=======
}
>>>>>>> feat/settings-page
