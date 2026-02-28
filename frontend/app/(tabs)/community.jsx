import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  StatusBar,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

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
      className="bg-muted items-center justify-center"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Feather name="user" size={size * 0.6} color="#666" />
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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

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
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: HEADER_MIN_HEIGHT + 10,
          paddingBottom: 40
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Grand titre */}
        <Animated.View style={{ opacity: largeTitleOpacity }}>
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
                  {100 - item * 5} pts
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity feed */}
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
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/standalone/stats")}
          className="mt-8 bg-primary py-4 rounded-full items-center"
        >
          <Text className="text-primary-foreground font-semibold">
            {t("community.viewStats")}
          </Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}