import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

const exerciseData = [
  {
    id: "1",
    titleKey: "exercises.categories.socialFamily",
    descriptionKey: "exercises.categories.socialFamilyDesc",
    locked: false,
    route: "/exercices/famille/exos1",
  },
  {
    id: "2",
    titleKey: "exercises.categories.cooking",
    descriptionKey: "exercises.categories.cookingDesc",
    locked: true,
    route: "/exercices/cuisine",
  },
  {
    id: "3",
    titleKey: "exercises.categories.clothing",
    descriptionKey: "exercises.categories.clothingDesc",
    locked: true,
    route: "/exercices/vetements",
  },
  {
    id: "4",
    titleKey: "exercises.categories.faunaFlora",
    descriptionKey: "exercises.categories.faunaFloraDesc",
    locked: true,
    route: "/exercices/faune",
  },
];

const ExerciseCard = ({ item, onPress, t }) => {
  return (
    <TouchableOpacity
      disabled={item.locked}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      className={`relative rounded-2xl p-6 mb-4 border border-border 
      ${item.locked ? "bg-muted opacity-60" : "bg-primary"}`}
    >
      {item.locked && (
        <Ionicons
          name="lock-closed"
          size={20}
          className="absolute top-4 right-4 text-primary-foreground"
        />
      )}

      <Text
        className={`text-lg font-bold uppercase mb-2 
        ${item.locked ? "text-muted-foreground" : "text-primary-foreground"}`}
      >
        {t(item.titleKey)}
      </Text>

      <Text
        className={`mb-4 
        ${item.locked ? "text-muted-foreground" : "text-primary-foreground"}`}
      >
        {t(item.descriptionKey)}
      </Text>

      {!item.locked && (
        <Text className="text-primary-foreground font-semibold">
          {t("exercises.start")}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default function ExercicesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleCardPress = (item) => {
    if (!item.locked) {
      router.push(item.route);
    }
  };

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
          {t("nav.exercises")}
        </Text>
      </Animated.View>

      <Animated.FlatList
        data={exerciseData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={handleCardPress}
            t={t}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: HEADER_MIN_HEIGHT + 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View style={{ opacity: largeTitleOpacity }}>
            <Text className="text-3xl font-bold text-primary mb-4">
              {t("nav.exercises")}
            </Text>

            <Text className="text-muted-foreground mb-6 leading-6">
              {t("exercises.introText")}
            </Text>
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