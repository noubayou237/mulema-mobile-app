/**
 * useExercises Hook
 *
 * Custom hook for fetching and managing exercises from the backend API.
 * Handles authentication, loading states, and error handling.
 */

import { useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../src/services/api";

const STORAGE_KEY = "userSession";

export const useExercises = (blockId = null, themeId = null) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Get user ID from storage
  useEffect(() => {
    const getUserId = async () => {
      try {
        const session = await AsyncStorage.getItem(STORAGE_KEY);
        if (session) {
          const userData = JSON.parse(session);
          setUserId(userData.user?.id || userData.userId);
        }
      } catch (e) {
        console.error("Error getting user ID:", e);
      }
    };
    getUserId();
  }, []);

  // Fetch exercises by block
  const fetchBlockExercises = useCallback(
    async (blockIdToUse = blockId) => {
      if (!blockIdToUse) {
        setError("No block ID provided");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          `/exercises/block/${blockIdToUse}/generate`
        );
        const exercisesData = response.data;

        // Transform backend response to match frontend expected format
        const transformedExercises = transformBackendExercises(exercisesData);
        setExercises(transformedExercises);
        return transformedExercises;
      } catch (err) {
        console.error("Error fetching block exercises:", err);
        setError(err.message || "Failed to fetch exercises");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [blockId]
  );

  // Fetch exercises by theme
  const fetchThemeExercises = useCallback(
    async (themeIdToUse = themeId) => {
      if (!themeIdToUse) {
        setError("No theme ID provided");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(
          `/exercises/theme/${themeIdToUse}/generate`
        );
        const exercisesData = response.data;

        // Transform backend response to match frontend expected format
        const transformedExercises = transformBackendExercises(exercisesData);
        setExercises(transformedExercises);
        return transformedExercises;
      } catch (err) {
        console.error("Error fetching theme exercises:", err);
        setError(err.message || "Failed to fetch exercises");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [themeId]
  );

  // Get words for review (spaced repetition)
  const fetchWordsForReview = useCallback(
    async (userIdToUse = userId) => {
      if (!userIdToUse) {
        setError("No user ID provided");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/exercises/review/${userIdToUse}`);
        return response.data;
      } catch (err) {
        console.error("Error fetching review words:", err);
        setError(err.message || "Failed to fetch review words");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Update word progress after answering
  const updateWordProgress = useCallback(
    async (wordId, isCorrect, userIdToUse = userId) => {
      if (!userIdToUse || !wordId) {
        setError("Missing user ID or word ID");
        return null;
      }

      try {
        const response = await api.post("/exercises/word-progress", {
          userId: userIdToUse,
          wordId,
          isCorrect
        });
        return response.data;
      } catch (err) {
        console.error("Error updating word progress:", err);
        return null;
      }
    },
    [userId]
  );

  // Complete an exercise session
  const completeExercise = useCallback(
    async (exerciseId, accuracy, timeSpent, userIdToUse = userId) => {
      if (!exerciseId || !userIdToUse) {
        setError("Missing exercise ID or user ID");
        return null;
      }

      try {
        const response = await api.patch(`/exercises/${exerciseId}/complete`, {
          userId: userIdToUse,
          accuracy,
          timeSpent
        });
        return response.data;
      } catch (err) {
        console.error("Error completing exercise:", err);
        return null;
      }
    },
    [userId]
  );

  // Clear exercises from state
  const clearExercises = useCallback(() => {
    setExercises([]);
    setError(null);
  }, []);

  return {
    exercises,
    loading,
    error,
    userId,
    fetchBlockExercises,
    fetchThemeExercises,
    fetchWordsForReview,
    updateWordProgress,
    completeExercise,
    clearExercises
  };
};

/**
 * Transform backend exercise format to frontend expected format
 */
const transformBackendExercises = (backendExercises) => {
  if (!Array.isArray(backendExercises)) {
    return [];
  }

  return backendExercises.map((exercise) => {
    // Handle MATCHING exercise
    if (exercise.type === "MATCHING") {
      return {
        id: exercise.id,
        type: "MATCHING",
        questions: exercise.questions?.[0]?.pairs || [],
        instruction: exercise.questions?.[0]?.instruction || "Match the words"
      };
    }

    // Handle LISTEN_WRITE exercise
    if (exercise.type === "LISTEN_WRITE") {
      return {
        id: exercise.id,
        type: "LISTEN_WRITE",
        word: exercise.questions?.[0]?.word || {},
        instruction: exercise.questions?.[0]?.instruction || "Listen and write"
      };
    }

    // Handle LISTEN_SELECT_IMAGE exercise
    if (exercise.type === "LISTEN_SELECT_IMAGE") {
      return {
        id: exercise.id,
        type: "LISTEN_SELECT_IMAGE",
        word: exercise.questions?.[0]?.word || {},
        options: exercise.questions?.[0]?.options || [],
        instruction:
          exercise.questions?.[0]?.instruction ||
          "Listen and select the correct image"
      };
    }

    return exercise;
  });
};

export default useExercises;
