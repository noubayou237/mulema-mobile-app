<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { useUser } from "@/src/context/UserContext";

/**
 * Hook for managing learning progression
 *
=======
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useUser } from '@/src/context/UserContext';

/**
 * Hook for managing learning progression
 * 
>>>>>>> feat/settings-page
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

<<<<<<< HEAD
  // Initialize progress for a level (unlocks first lesson)
  const initializeProgress = useCallback(
    async (fetchFn) => {
      if (!user || !levelId) return false;

      try {
        await api.post(`/progress/init/${levelId}`);
        // Fetch again after initialization
        if (fetchFn) await fetchFn();
        return true;
      } catch (err) {
        console.error("Error initializing progress:", err.message);
        return false;
      }
    },
    [user, levelId]
  );

  // Fetch progress from backend
  const fetchProgress = useCallback(async () => {
    // Reset loading state at start
    setLoading(true);
    setError(null);

    if (!user || !levelId) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/progress/level/${levelId}`);
      setLessons(response.data);
    } catch (err) {
      console.error("Error fetching progress:", err.message);

      // Handle different error types
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError("Please sign in to continue");
          setLessons([]);
        } else if (err.response.status === 404) {
          // User hasn't initialized progress yet - try to initialize
          const initialized = await initializeProgress(fetchProgress);
          if (!initialized) {
            // If initialization failed, use empty lessons
            setLessons([]);
          }
        } else {
          // Other server errors
          setError(err.response.data?.message || "Failed to load progress");
          setLessons([]);
        }
      } else if (err.request) {
        // Network error - no response received
        setError("Unable to connect. Using offline mode.");
        setLessons([]);
      } else {
        // Other errors
        setError(err.message);
        setLessons([]);
=======
  // Fetch progress from backend
  const fetchProgress = useCallback(async () => {
    if (!user || !levelId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/progress/level/${levelId}`);
      setLessons(response.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      // If 404, user hasn't initialized progress yet
      if (err.response?.status === 404) {
        await initializeProgress();
      } else {
        setError(err.message);
>>>>>>> feat/settings-page
      }
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, [user, levelId, initializeProgress]);

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
        console.error("Error completing lesson:", err.message);
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
=======
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
      console.error('Error initializing progress:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, levelId, fetchProgress]);

  // Complete a lesson and unlock the next one
  const completeLesson = useCallback(async (lessonId, stars) => {
    if (!user || !levelId) return;
    
    try {
      await api.post('/progress/complete', {
        lessonId,
        stars,
      });
      
      // Update local state with new progress
      setLessons(prev => {
        return prev.map(lesson => {
          if (lesson.id === lessonId) {
            return { ...lesson, isCompleted: true, stars };
          }
          // Unlock next lesson
          const currentLesson = prev.find(l => l.id === lessonId);
          if (currentLesson && lesson.order === currentLesson.order + 1) {
            return { ...lesson, isUnlocked: true };
          }
          return lesson;
        });
      });
      
      return true;
    } catch (err) {
      console.error('Error completing lesson:', err);
      setError(err.message);
      return false;
    }
  }, [user, levelId]);

  // Get lesson by ID
  const getLesson = useCallback((lessonId) => {
    return lessons.find(l => l.id === lessonId);
  }, [lessons]);

  // Check if all lessons are completed
  const isLevelCompleted = useCallback(() => {
    return lessons.length > 0 && lessons.every(l => l.isCompleted);
>>>>>>> feat/settings-page
  }, [lessons]);

  // Get total stars earned
  const totalStars = useCallback(() => {
    return lessons.reduce((sum, l) => sum + (l.stars || 0), 0);
  }, [lessons]);

  // Initial fetch
  useEffect(() => {
<<<<<<< HEAD
    // Small delay to ensure user context is loaded
    const timer = setTimeout(() => {
      fetchProgress();
    }, 100);

    return () => clearTimeout(timer);
=======
    fetchProgress();
>>>>>>> feat/settings-page
  }, [fetchProgress]);

  return {
    lessons,
    loading,
    error,
<<<<<<< HEAD
    initializeProgress: () => fetchProgress(),
=======
    initializeProgress,
>>>>>>> feat/settings-page
    completeLesson,
    getLesson,
    isLevelCompleted,
    totalStars,
<<<<<<< HEAD
    refetch: fetchProgress
=======
    refetch: fetchProgress,
>>>>>>> feat/settings-page
  };
}

export default useLearningProgress;
