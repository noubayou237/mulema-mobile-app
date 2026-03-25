import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
<<<<<<< HEAD
  StyleSheet,
  ActivityIndicator
=======
>>>>>>> feat/settings-page
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

<<<<<<< HEAD
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

// Default exercise data - locked status will be dynamically updated
=======
const HEADER_MIN_HEIGHT = 40;
const HEADER_SCROLL_FADE_END = 80;

>>>>>>> feat/settings-page
const exerciseData = [
  {
    id: "1",
    titleKey: "exercises.categories.socialFamily",
    descriptionKey: "exercises.categories.socialFamilyDesc",
    locked: false,
    route: "/exercices/famille/exos1",
<<<<<<< HEAD
    storageKey: null // First theme is always unlocked
=======
>>>>>>> feat/settings-page
  },
  {
    id: "2",
    titleKey: "exercises.categories.cooking",
    descriptionKey: "exercises.categories.cookingDesc",
    locked: true,
    route: "/exercices/cuisine",
<<<<<<< HEAD
    storageKey: "theme2_unlocked"
=======
>>>>>>> feat/settings-page
  },
  {
    id: "3",
    titleKey: "exercises.categories.clothing",
    descriptionKey: "exercises.categories.clothingDesc",
    locked: true,
    route: "/exercices/vetements",
<<<<<<< HEAD
    storageKey: "theme3_unlocked"
=======
>>>>>>> feat/settings-page
  },
  {
    id: "4",
    titleKey: "exercises.categories.faunaFlora",
    descriptionKey: "exercises.categories.faunaFloraDesc",
    locked: true,
    route: "/exercices/faune",
<<<<<<< HEAD
    storageKey: "theme4_unlocked"
  }
=======
  },
>>>>>>> feat/settings-page
];

const ExerciseCard = ({ item, onPress, t }) => {
  return (
    <TouchableOpacity
      disabled={item.locked}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
<<<<<<< HEAD
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
=======
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
>>>>>>> feat/settings-page
      >
        {t(item.titleKey)}
      </Text>

      <Text
<<<<<<< HEAD
        style={[
          styles.exerciseDescription,
          item.locked ? styles.textLocked : styles.textUnlocked
        ]}
=======
        className={`mb-4 
        ${item.locked ? "text-muted-foreground" : "text-primary-foreground"}`}
>>>>>>> feat/settings-page
      >
        {t(item.descriptionKey)}
      </Text>

      {!item.locked && (
<<<<<<< HEAD
        <Text style={styles.startText}>{t("exercises.start")}</Text>
=======
        <Text className="text-primary-foreground font-semibold">
          {t("exercises.start")}
        </Text>
>>>>>>> feat/settings-page
      )}
    </TouchableOpacity>
  );
};

export default function ExercicesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;

<<<<<<< HEAD
  // State for tracking theme unlock status
  const [unlockedThemes, setUnlockedThemes] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unlock status from AsyncStorage on mount
  useEffect(() => {
    const fetchUnlockStatus = async () => {
      try {
        const unlocked = {};

        // Check each theme's unlock status
        for (const theme of exerciseData) {
          if (theme.storageKey) {
            const status = await AsyncStorage.getItem(theme.storageKey);
            unlocked[theme.id] = status === "true";
          } else {
            // First theme is always unlocked
            unlocked[theme.id] = true;
          }
        }

        setUnlockedThemes(unlocked);
      } catch (error) {
        console.error("Error fetching unlock status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnlockStatus();
  }, []);

  // Calculate dynamic exercise data with current unlock status
  const getExerciseData = () => {
    return exerciseData.map((theme) => ({
      ...theme,
      locked: !unlockedThemes[theme.id]
    }));
  };

=======
>>>>>>> feat/settings-page
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

<<<<<<< HEAD
  // Show loading while fetching unlock status
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#5A4FCF' />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />
=======
  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" />
>>>>>>> feat/settings-page

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
<<<<<<< HEAD
        data={getExerciseData()}
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
=======
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
>>>>>>> feat/settings-page
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
<<<<<<< HEAD
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
=======
}
>>>>>>> feat/settings-page
