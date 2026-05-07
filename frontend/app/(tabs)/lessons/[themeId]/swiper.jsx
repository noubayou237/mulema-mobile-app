import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useThemeStore } from "../../../../src/stores/useThemeStore";
import { useLanguageStore } from "../../../../src/stores/useLanguageStore";
import { getBassaEnrichment } from "../../../data/bassaLessonsData";
import { getDualaEnrichment } from "../../../data/dualaLessonsData";
import { getGhomalaEnrichment } from "../../../data/ghomalaLessonsData";
import { Colors } from "../../../../src/theme/tokens";

export default function SwiperRedirect() {
  const { themeId, category } = useLocalSearchParams();
  const router = useRouter();
  const { lessons, fetchLessons, currentThemeId } = useThemeStore();
  const { activeLanguage } = useLanguageStore();

  useEffect(() => {
    if (themeId && (lessons.length === 0 || currentThemeId !== themeId)) {
      fetchLessons(themeId);
    }
  }, [themeId]);

  useEffect(() => {
    if (lessons && lessons.length > 0 && currentThemeId === themeId) {
      // Filter lessons to find the first one in this category
      let filtered = lessons;
      if (category) {
        filtered = lessons.filter(l => {
          let enrichment = null;
          if (activeLanguage?.name?.toLowerCase() === "bassa") {
            enrichment = getBassaEnrichment(l.title);
          } else if (activeLanguage?.name?.toLowerCase() === "duala") {
            enrichment = getDualaEnrichment(l.title);
          } else if (activeLanguage?.name?.toLowerCase() === "ghomala") {
            enrichment = getGhomalaEnrichment(l.title);
          }
          return enrichment?.category === category;
        });
      }
      
      const firstId = filtered.length > 0 ? filtered[0].id : lessons[0].id;
      
      router.replace({
        pathname: `/(tabs)/lessons/${themeId}/lesson/${firstId}`,
        params: { category }
      });
    }
  }, [lessons, currentThemeId, activeLanguage, category]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
