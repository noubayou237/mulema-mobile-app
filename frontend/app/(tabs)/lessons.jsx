import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  ActivityIndicator
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useTranslation } from "react-i18next";
import { useLearningProgress } from "../hooks/useLearningProgress";

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
      className={`mx-4 mb-4 rounded-2xl px-6 py-5 flex-row items-center justify-between border border-border
      ${isUnlocked ? "bg-card" : "bg-muted opacity-60"}`}
    >
      <View className='flex-row items-center'>
        {item.id === "1" && (
          <Image
            source={{ uri: "https://i.imgur.com/uR5p0Qz.png" }}
            className='w-10 h-10 rounded-full mr-3'
          />
        )}

        <View>
          <Text
            className={`text-lg font-semibold uppercase
            ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}
          >
            {item.title}
          </Text>

          {/* Show stars if completed */}
          {isCompleted && (
            <View className='flex-row mt-1'>
              {[1, 2, 3].map((star) => (
                <FontAwesome
                  key={star}
                  name={star <= stars ? "star" : "star-o"}
                  size={14}
                  color={star <= stars ? "#FFD700" : "#999"}
                  className='mr-1'
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {isUnlocked ? (
        <View className='flex-row items-center'>
          {isCompleted && (
            <View className='mr-2'>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <StatusBar barStyle='dark-content' />

      {/* Petit header flottant */}
      <Animated.View
        style={{ opacity: smallHeaderOpacity }}
        className='absolute top-0 left-0 right-0 h-10 bg-background border-b border-border items-center justify-center z-10'
      >
        <Text className='font-bold text-primary'>{t("nav.lessons")}</Text>
      </Animated.View>

      <Animated.FlatList
        data={SAMPLE_LESSONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LessonItem item={item} progress={progressData} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_MIN_HEIGHT + 16,
          paddingBottom: 100
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <Animated.View style={{ opacity: largeTitleOpacity }}>
            <Text className='text-3xl font-bold text-center mt-8 mb-4'>
              {t("nav.lessons")}
            </Text>
            <Text className='text-center text-muted-foreground mb-6 px-6'>
              Complete lessons to unlock new content
            </Text>
          </Animated.View>
        }
      />
    </SafeAreaView>
  );
}
