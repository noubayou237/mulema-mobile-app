import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";

const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

const LESSON_DATA = Array.from({ length: 20 }, (_, index) => {
  const lessonNumber = index + 1;
  return {
    id: String(lessonNumber),
    title: `Lesson ${lessonNumber}`,
    unlocked: lessonNumber <= 2,
  };
});

const LessonItem = ({ item }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      disabled={!item.unlocked}
      onPress={() => item.unlocked && router.push(`/lessons/${item.id}`)}
      activeOpacity={0.85}
      className={`mx-4 mb-4 rounded-2xl px-6 py-5 flex-row items-center justify-between border border-border
      ${item.unlocked ? "bg-card" : "bg-muted opacity-60"}`}
    >
      <View className="flex-row items-center">
        {item.id === "1" && (
          <Image
            source={{ uri: "https://i.imgur.com/uR5p0Qz.png" }}
            className="w-10 h-10 rounded-full mr-3"
          />
        )}

        <Text
          className={`text-lg font-semibold uppercase
          ${item.unlocked ? "text-foreground" : "text-muted-foreground"}`}
        >
          {item.title}
        </Text>
      </View>

      {item.unlocked ? (
        <Icon name="chevron-right" size={24} color="#000" />
      ) : (
        <FontAwesome name="lock" size={20} color="#999" />
      )}
    </TouchableOpacity>
  );
};

export default function Lessons() {
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const smallHeaderOpacity = scrollY.interpolate({
    inputRange: [HEADER_SCROLL_FADE_END / 2, HEADER_SCROLL_FADE_END],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_FADE_END / 2],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />

      {/* Petit header flottant */}
      <Animated.View
        style={{ opacity: smallHeaderOpacity }}
        className="absolute top-0 left-0 right-0 h-10 bg-background border-b border-border items-center justify-center z-10"
      >
        <Text className="font-bold text-primary">
          {t("nav.lessons")}
        </Text>
      </Animated.View>

      <Animated.FlatList
        data={LESSON_DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LessonItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_MIN_HEIGHT + 16,
          paddingBottom: 40,
        }}
        ListHeaderComponent={
          <Animated.View
            style={{ opacity: largeTitleOpacity }}
            className="px-4 mb-6"
          >
            <Text className="text-3xl font-bold text-primary mb-4">
              {t("nav.lessons")}
            </Text>

            <View className="bg-card rounded-2xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">
                {t("lessons.completeToUnlock")}
              </Text>

              <Text className="text-muted-foreground">
                {t("lessons.stepByStep")}
              </Text>
            </View>
          </Animated.View>
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
  );
}