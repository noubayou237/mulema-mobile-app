import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useLearningProgress } from "../hooks/useLearningProgress";

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
          />
        )}

        <View>
          <Text
            style={[
              styles.lessonTitle,
              isUnlocked ? styles.textUnlocked : styles.textLocked
            ]}
          >
            {item.title}
          </Text>

          {/* Show stars if completed */}
          {isCompleted && (
            <View style={styles.starsRow}>
              {[1, 2, 3].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= stars ? "star" : "star-o"}
                  size={14}
                  color={star <= stars ? "#FFD700" : "#999"}
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {isUnlocked ? (
        <View style={styles.lessonRight}>
          {isCompleted && (
            <View style={styles.checkIcon}>
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
    error,
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

  // Show loading only on initial load
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#5A4FCF' />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' />

      {/* Petit header flottant */}
      <Animated.View
        style={[styles.smallHeader, { opacity: smallHeaderOpacity }]}
      >
        <Text style={styles.smallHeaderText}>{t("nav.lessons")}</Text>
      </Animated.View>

      <Animated.FlatList
        data={SAMPLE_LESSONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonItem item={item} progress={progressData} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.View style={{ opacity: largeTitleOpacity }}>
            <Text style={styles.mainTitle}>{t("nav.lessons")}</Text>
            <Text style={styles.subtitle}>
              Complete lessons to unlock new content
            </Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}

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
