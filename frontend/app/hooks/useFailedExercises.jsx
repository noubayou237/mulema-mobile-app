import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "failed_exercises";

/**
 * Custom hook for tracking failed exercises
 *
 * Features:
 * - Track failed exercises and their details
 * - Store failed exercises for later retry
 * - Clear failed exercises after successful retry
 */
export const useFailedExercises = () => {
  const [failedExercises, setFailedExercises] = useState([]);

  // Load failed exercises from storage
  const loadFailedExercises = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFailedExercises(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading failed exercises:", error);
    }
  }, []);

  // Add a failed exercise
  const addFailedExercise = useCallback(async (exercise) => {
    const newFailed = {
      id: exercise.id || Date.now().toString(),
      type: exercise.type,
      question: exercise.question,
      correctAnswer: exercise.correctAnswer,
      userAnswer: exercise.userAnswer,
      timestamp: Date.now()
    };

    setFailedExercises((prev) => {
      // Avoid duplicates
      const exists = prev.some(
        (e) => e.question === newFailed.question && e.type === newFailed.type
      );

      if (exists) return prev;

      const updated = [...prev, newFailed];

      // Save to storage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        console.error("Error saving failed exercises:", err)
      );

      return updated;
    });
  }, []);

  // Remove a failed exercise after successful retry
  const removeFailedExercise = useCallback(async (exerciseId) => {
    setFailedExercises((prev) => {
      const updated = prev.filter((e) => e.id !== exerciseId);

      // Save to storage
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch((err) =>
        console.error("Error saving failed exercises:", err)
      );

      return updated;
    });
  }, []);

  // Clear all failed exercises
  const clearFailedExercises = useCallback(async () => {
    setFailedExercises([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if there are failed exercises
  const hasFailedExercises = failedExercises.length > 0;

  // Get the next failed exercise to retry
  const getNextFailedExercise = useCallback(() => {
    return failedExercises[0] || null;
  }, [failedExercises]);

  return {
    failedExercises,
    loadFailedExercises,
    addFailedExercise,
    removeFailedExercise,
    clearFailedExercises,
    hasFailedExercises,
    getNextFailedExercise
  };
};

export default useFailedExercises;
