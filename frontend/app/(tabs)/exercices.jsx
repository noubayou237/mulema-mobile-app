import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  StyleSheet
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// Design tokens (matching profile page)
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

const exerciseData = [
  {
    id: "1",
    titleKey: "exercises.categories.socialFamily",
    descriptionKey: "exercises.categories.socialFamilyDesc",
    locked: false,
    route: "/exercices/famille/exos1"
  },
  {
    id: "2",
    titleKey: "exercises.categories.cooking",
    descriptionKey: "exercises.categories.cookingDesc",
    locked: true,
    route: "/exercices/cuisine"
  },
  {
    id: "3",
    titleKey: "exercises.categories.clothing",
    descriptionKey: "exercises.categories.clothingDesc",
    locked: true,
    route: "/exercices/vetements"
  },
  {
    id: "4",
    titleKey: "exercises.categories.faunaFlora",
    descriptionKey: "exercises.categories.faunaFloraDesc",
    locked: true,
    route: "/exercices/faune"
  }
];

const ExerciseCard = ({ item, onPress, t }) => {
  return (
    <TouchableOpacity
      disabled={item.locked}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
      style={[
        styles.exerciseCard,
        item.locked ? styles.exerciseCardLocked : styles.exerciseCardUnlocked
      ]}
    >
      {item.locked && (
        <Ionicons name='lock-closed' size={20} style={styles.lockIcon} />
      )}

      <Text
        style={[
          styles.exerciseTitle,
          item.locked ? styles.textLocked : styles.textUnlocked
        ]}
      >
        {t(item.titleKey)}
      </Text>

      <Text
        style={[
          styles.exerciseDescription,
          item.locked ? styles.textLocked : styles.textUnlocked
        ]}
      >
        {t(item.descriptionKey)}
      </Text>

      {!item.locked && (
        <Text style={styles.startText}>{t("exercises.start")}</Text>
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

      {/* Petit header flottant */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>{t("nav.exercises")}</Text>
      </Animated.View>

      <Animated.FlatList
        data={exerciseData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard item={item} onPress={handleCardPress} t={t} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View style={{ opacity: largeTitleOpacity }}>
            <Text style={styles.mainTitle}>{t("nav.exercises")}</Text>

            <Text style={styles.subtitle}>{t("exercises.introText")}</Text>
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
    fontWeight: "bold",
    color: COLORS.primary,
    fontSize: 14
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: HEADER_MIN_HEIGHT + 16,
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
    marginBottom: 24,
    lineHeight: 22
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  exerciseCardUnlocked: {
    backgroundColor: COLORS.primary
  },
  exerciseCardLocked: {
    backgroundColor: COLORS.background,
    opacity: 0.6
  },
  lockIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    color: COLORS.foreground
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8
  },
  exerciseDescription: {
    marginBottom: 16
  },
  textUnlocked: {
    color: "#FFFFFF"
  },
  textLocked: {
    color: COLORS.muted
  },
  startText: {
    color: "#FFFFFF",
    fontWeight: "600"
  }
});
