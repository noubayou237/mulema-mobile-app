import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { useUser } from "@/src/context/UserContext";

/**
 * Hook for managing learning progression
 *
 * Features:
 * - Fetch lesson progress for a level
 * - Initialize progress for new users
 * - Complete lessons and unlock next ones
 * - Track stars earned
 */
export function useLearningProgress(levelId) {
  const { user } = useUser();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch progress from backend
  const fetchProgress = useCallback(async () => {
    if (!user || !levelId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/progress/level/${levelId}`);
      setLessons(response.data);
    } catch (err) {
      console.error("Error fetching progress:", err);
      // If 401 (unauthorized), user is not logged in - don't retry
      if (err.response?.status === 401) {
        setError("Please sign in to continue");
        setLessons([]);
      }
      // If 404, user hasn't initialized progress yet
      else if (err.response?.status === 404) {
        await initializeProgress();
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, levelId]);

  // Initialize progress for a level (unlocks first lesson)
  const initializeProgress = useCallback(async () => {
    if (!user || !levelId) return;

    try {
      setLoading(true);
      await api.post(`/progress/init/${levelId}`);
      // Fetch again after initialization
      await fetchProgress();
    } catch (err) {
      console.error("Error initializing progress:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, levelId, fetchProgress]);

  // Complete a lesson and unlock the next one
  const completeLesson = useCallback(
    async (lessonId, stars) => {
      if (!user || !levelId) return;

      try {
        await api.post("/progress/complete", {
          lessonId,
          stars
        });

        // Update local state with new progress
        setLessons((prev) => {
          return prev.map((lesson) => {
            if (lesson.id === lessonId) {
              return { ...lesson, isCompleted: true, stars };
            }
            // Unlock next lesson
            const currentLesson = prev.find((l) => l.id === lessonId);
            if (currentLesson && lesson.order === currentLesson.order + 1) {
              return { ...lesson, isUnlocked: true };
            }
            return lesson;
          });
        });

        return true;
      } catch (err) {
        console.error("Error completing lesson:", err);
        setError(err.message);
        return false;
      }
    },
    [user, levelId]
  );

  // Get lesson by ID
  const getLesson = useCallback(
    (lessonId) => {
      return lessons.find((l) => l.id === lessonId);
    },
    [lessons]
  );

  // Check if all lessons are completed
  const isLevelCompleted = useCallback(() => {
    return lessons.length > 0 && lessons.every((l) => l.isCompleted);
  }, [lessons]);

  // Get total stars earned
  const totalStars = useCallback(() => {
    return lessons.reduce((sum, l) => sum + (l.stars || 0), 0);
  }, [lessons]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    lessons,
    loading,
    error,
    initializeProgress,
    completeLesson,
    getLesson,
    isLevelCompleted,
    totalStars,
    refetch: fetchProgress
  };
}

export default useLearningProgress;
