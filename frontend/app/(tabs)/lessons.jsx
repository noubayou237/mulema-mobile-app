import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
<<<<<<< HEAD
  ActivityIndicator,
  StyleSheet
=======
  ActivityIndicator
>>>>>>> feat/settings-page
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useLearningProgress } from "../hooks/useLearningProgress";
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

// Sample lesson data - in production this would come from backend
const SAMPLE_LESSONS = Array.from({ length: 20 }, (_, index) => {
  const lessonNumber = index + 1;
  return {
    id: String(lessonNumber),
    title: `Lesson ${lessonNumber}`,
    order: lessonNumber
  };
});

const LessonItem = ({ item, progress }) => {
  const router = useRouter();

  // Get progress for this lesson from backend
  const lessonProgress = progress?.find((p) => p.id === item.id);
  const isUnlocked = lessonProgress?.isUnlocked ?? item.order === 1; // First lesson always unlocked by default
  const isCompleted = lessonProgress?.isCompleted ?? false;
  const stars = lessonProgress?.stars ?? 0;

  return (
    <TouchableOpacity
      disabled={!isUnlocked}
      onPress={() => isUnlocked && router.push(`/lessons/${item.id}`)}
      activeOpacity={0.85}
<<<<<<< HEAD
      style={[
        styles.lessonCard,
        isUnlocked ? styles.lessonCardUnlocked : styles.lessonCardLocked
      ]}
    >
      <View style={styles.lessonLeft}>
        {item.id === "1" && (
          <Image
            source={{ uri: "https://i.imgur.com/uR5p0Qz.png" }}
            style={styles.lessonImage}
=======
      className={`mx-4 mb-4 rounded-2xl px-6 py-5 flex-row items-center justify-between border border-border
      ${isUnlocked ? "bg-card" : "bg-muted opacity-60"}`}
    >
      <View className='flex-row items-center'>
        {item.id === "1" && (
          <Image
            source={{ uri: "https://i.imgur.com/uR5p0Qz.png" }}
            className='w-10 h-10 rounded-full mr-3'
>>>>>>> feat/settings-page
          />
        )}

        <View>
          <Text
<<<<<<< HEAD
            style={[
              styles.lessonTitle,
              isUnlocked ? styles.textUnlocked : styles.textLocked
            ]}
=======
            className={`text-lg font-semibold uppercase
            ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}
>>>>>>> feat/settings-page
          >
            {item.title}
          </Text>

          {/* Show stars if completed */}
          {isCompleted && (
<<<<<<< HEAD
            <View style={styles.starsRow}>
=======
            <View className='flex-row mt-1'>
>>>>>>> feat/settings-page
              {[1, 2, 3].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= stars ? "star" : "star-o"}
                  size={14}
                  color={star <= stars ? "#FFD700" : "#999"}
<<<<<<< HEAD
                  style={{ marginRight: 4 }}
=======
                  className='mr-1'
>>>>>>> feat/settings-page
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {isUnlocked ? (
<<<<<<< HEAD
        <View style={styles.lessonRight}>
          {isCompleted && (
            <View style={styles.checkIcon}>
=======
        <View className='flex-row items-center'>
          {isCompleted && (
            <View className='mr-2'>
>>>>>>> feat/settings-page
              <Icon name='check-circle' size={20} color='#4CAF50' />
            </View>
          )}
          <Icon name='chevron-right' size={24} color='#000' />
        </View>
      ) : (
        <FontAwesome name='lock' size={20} color='#999' />
      )}
    </TouchableOpacity>
  );
};

export default function Lessons() {
  const { t } = useTranslation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { lang } = useLocalSearchParams();

  // Use backend API for progression
  // For now, use a default level ID - in production this would come from route params
  const levelId = "level-1";
  const {
    lessons: progressData,
    loading,
<<<<<<< HEAD
    error,
=======
>>>>>>> feat/settings-page
    initializeProgress
  } = useLearningProgress(levelId);

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

<<<<<<< HEAD
  // Show loading only on initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#5A4FCF' />
        <Text style={styles.loadingText}>Loading progress...</Text>
=======
  // Initialize progress on first load if needed
  useEffect(() => {
    if (!loading && progressData.length === 0) {
      initializeProgress();
    }
  }, [loading]);

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-background items-center justify-center'>
        <ActivityIndicator size='large' color='#5A4FCF' />
        <Text className='mt-4 text-muted-foreground'>Loading progress...</Text>
>>>>>>> feat/settings-page
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
    <SafeAreaView style={styles.container}>
=======
    <SafeAreaView className='flex-1 bg-background'>
>>>>>>> feat/settings-page
      <StatusBar barStyle='dark-content' />

      {/* Petit header flottant */}
      <Animated.View
        style={{ opacity: smallHeaderOpacity }}
        className='absolute top-0 left-0 right-0 h-10 bg-background border-b border-border items-center justify-center z-10'
      >
<<<<<<< HEAD
        <Text style={styles.smallHeaderText}>{t("nav.lessons")}</Text>
=======
        <Text className='font-bold text-primary'>{t("nav.lessons")}</Text>
>>>>>>> feat/settings-page
      </Animated.View>

      <Animated.FlatList
        data={SAMPLE_LESSONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonItem item={item} progress={progressData} />
        )}
        showsVerticalScrollIndicator={false}
<<<<<<< HEAD
        contentContainerStyle={styles.listContent}
=======
        contentContainerStyle={{
          paddingTop: HEADER_MIN_HEIGHT + 16,
          paddingBottom: 100
        }}
>>>>>>> feat/settings-page
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.View style={{ opacity: largeTitleOpacity }}>
<<<<<<< HEAD
            <Text style={styles.mainTitle}>{t("nav.lessons")}</Text>
            <Text style={styles.subtitle}>
=======
            <Text className='text-3xl font-bold text-center mt-8 mb-4'>
              {t("nav.lessons")}
            </Text>
            <Text className='text-center text-muted-foreground mb-6 px-6'>
>>>>>>> feat/settings-page
              Complete lessons to unlock new content
            </Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}
<<<<<<< HEAD

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.muted
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
    paddingTop: HEADER_MIN_HEIGHT + 16,
    paddingBottom: 100
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16
  },
  subtitle: {
    textAlign: "center",
    color: COLORS.muted,
    marginBottom: 24,
    paddingHorizontal: 24
  },
  lessonCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: COLORS.border
  },
  lessonCardUnlocked: {
    backgroundColor: COLORS.card
  },
  lessonCardLocked: {
    backgroundColor: COLORS.background,
    opacity: 0.6
  },
  lessonLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  lessonImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase"
  },
  textUnlocked: {
    color: COLORS.foreground
  },
  textLocked: {
    color: COLORS.muted
  },
  starsRow: {
    flexDirection: "row",
    marginTop: 4
  },
  lessonRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  checkIcon: {
    marginRight: 8
  }
});
=======
>>>>>>> feat/settings-page
