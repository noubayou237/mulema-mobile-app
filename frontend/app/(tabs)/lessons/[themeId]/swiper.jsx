/**
 * SwiperRedirect — instant redirect screen.
 *
 * Priority order (fastest → slowest):
 *  1. Data already in store for this themeId → navigate immediately (0ms)
 *  2. Virtual themeId (ghomala_* / duala_*) → inject local data → navigate (0ms)
 *  3. Real API themeId → fetch lessons → navigate when ready
 */
import { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStore } from "../../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../../src/stores/useLanguageStore";
import { getBassaEnrichment } from "../../../data/bassaLessonsData";
import { getDualaEnrichment, getDualaVirtualData } from "../../../data/dualaLessonsData";
import { getGhomalaEnrichment, getGhomalaVirtualData } from "../../../data/ghomalaLessonsData";
import { Colors } from "../../../../src/theme/tokens";

export default function SwiperRedirect() {
  const { themeId, category } = useLocalSearchParams();
  const router = useRouter();
  const { lessons, fetchLessons, currentThemeId, setVirtualData, error } = useThemeStore();
  const { activeLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const navigated = useRef(false);

  // ── Helper: pick the first lesson matching the category filter ──
  function resolveFirstLesson(lessonList) {
    if (!lessonList || lessonList.length === 0) return null;
    if (!category) return lessonList[0];

    const langName = (activeLanguage?.name ?? "").toLowerCase();
    const filtered = lessonList.filter((l) => {
      let enrichment = null;
      if (langName.includes("bassa"))   enrichment = getBassaEnrichment(l.title);
      else if (langName.includes("duala"))  enrichment = getDualaEnrichment(l.title);
      else if (langName.includes("ghomala")) enrichment = getGhomalaEnrichment(l.title);
      return enrichment?.category === category;
    });
    return filtered.length > 0 ? filtered[0] : lessonList[0];
  }

  // ── Navigate to the resolved lesson ──
  function goToLesson(lessonList) {
    if (navigated.current) return;
    const first = resolveFirstLesson(lessonList);
    if (!first) return;
    navigated.current = true;
    router.replace({
      pathname: `/(tabs)/lessons/${themeId}/lesson/${first.id}`,
      params: { category },
    });
  }

  // ── Run once synchronously on mount (before first render paint) ──
  useEffect(() => {
    if (!themeId) return;

    // 1. Data already cached for this theme → go instantly
    const storeState = useThemeStore.getState();
    if (storeState.currentThemeId === themeId && storeState.lessons.length > 0) {
      goToLesson(storeState.lessons);
      return;
    }

    // 2. Virtual Ghomala theme → inject local data, navigate instantly
    if (themeId.startsWith("ghomala_")) {
      const virtualData = getGhomalaVirtualData(themeId);
      if (virtualData) {
        setVirtualData(themeId, virtualData);
        goToLesson(virtualData.lessons);
        return;
      }
    }

    // 3. Virtual Duala theme → inject local data, navigate instantly
    if (themeId.startsWith("duala_")) {
      const virtualData = getDualaVirtualData(themeId);
      if (virtualData) {
        setVirtualData(themeId, virtualData);
        goToLesson(virtualData.lessons);
        return;
      }
    }

    // 4. Real API themeId → fetch from network
    fetchLessons(themeId);
  }, [themeId]);

  // ── React to store update (for the API fetch path) ──
  useEffect(() => {
    if (
      lessons &&
      lessons.length > 0 &&
      currentThemeId === themeId &&
      !navigated.current
    ) {
      goToLesson(lessons);
    }
  }, [lessons, currentThemeId]);

  // Handle Error case
  if (error && !lessons.length) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={{ textAlign: "center", color: Colors.text, fontSize: 16, marginBottom: 24, paddingHorizontal: 20 }}>
          {error}
        </Text>
        <TouchableOpacity 
          onPress={() => fetchLessons(themeId)}
          style={{ backgroundColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 12 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>{t("common.retry") || "Retry"}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: Colors.textSub }}>{t("common.back") || "Back"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show a spinner only while waiting on a real network request
  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
