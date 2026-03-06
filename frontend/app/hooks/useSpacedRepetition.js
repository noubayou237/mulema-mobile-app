/**
 * useSpacedRepetition Hook
 *
 * Manages spaced repetition learning using the SM-2 algorithm.
 * Integrates with backend APIs for word progress tracking.
 *
 * Features:
 * - Fetch words due for review
 * - Track correct/incorrect answers
 * - Calculate next review date using SM-2
 * - Sync progress with backend
 */

import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWordsForReview as apiGetWordsForReview,
  updateWordProgress as apiUpdateWordProgress
} from "../src/services/ExerciseApiService";

const STORAGE_KEY = "spaced_repetition_state";

// SM-2 Algorithm constants
const INITIAL_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const INTERVALS = [1, 3, 7, 14, 30, 60]; // Days

/**
 * Calculate next review interval using SM-2 algorithm
 */
export const calculateNextInterval = (successCount, easeFactor = 2.5) => {
  const index = Math.min(successCount, INTERVALS.length - 1);
  return Math.round(INTERVALS[index] * easeFactor);
};

/**
 * Update ease factor based on answer quality
 * q: 0-100 (0-50 = fail, 50-100 = pass)
 */
export const updateEaseFactor = (currentEF, quality) => {
  const newEF =
    currentEF + (0.1 - (100 - quality) * (0.08 + (100 - quality) * 0.02));
  return Math.max(MIN_EASE_FACTOR, newEF);
};

/**
 * Format next review date
 */
export const formatNextReview = (date) => {
  if (!date) return "Not scheduled";

  const now = new Date();
  const reviewDate = new Date(date);
  const diffTime = reviewDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Due now";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.round(diffDays / 7)} weeks`;
  return `In ${Math.round(diffDays / 30)} months`;
};

const useSpacedRepetition = (userId) => {
  const [wordsForReview, setWordsForReview] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Fetch words due for review
  const fetchWordsForReview = useCallback(async () => {
    if (!userId) {
      // Use local mock data for demo
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        const now = new Date();
        const dueWords =
          state.words?.filter((w) => {
            if (!w.nextReview) return true;
            return new Date(w.nextReview) <= now;
          }) || [];
        setWordsForReview(dueWords);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use API service for backend sync
      await apiGetWordsForReview(userId);

      // Also try direct fetch as fallback
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/exercises/review/${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch review words");

      const data = await response.json();
      setWordsForReview(data);
      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
      // Fallback to local storage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        setWordsForReview(state.words || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Update word progress after an answer
  const recordAnswer = useCallback(
    async (wordId, isCorrect) => {
      const now = new Date();

      // Update local state
      setWordsForReview((prev) => {
        return prev.map((word) => {
          if (word.id !== wordId) return word;

          const newSuccessCount = isCorrect ? (word.successCount || 0) + 1 : 0;
          const newFailureCount = isCorrect
            ? word.failureCount || 0
            : (word.failureCount || 0) + 1;

          // Calculate new ease factor
          let newEaseFactor = word.easeFactor || INITIAL_EASE_FACTOR;
          if (!isCorrect) {
            newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2);
          }

          // Calculate next review date
          const interval = calculateNextInterval(
            newSuccessCount,
            newEaseFactor
          );
          const nextReview = new Date(
            now.getTime() + interval * 24 * 60 * 60 * 1000
          );

          return {
            ...word,
            successCount: newSuccessCount,
            failureCount: newFailureCount,
            easeFactor: newEaseFactor,
            lastReviewed: now,
            nextReview: nextReview
          };
        });
      });

      // Save to local storage
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const state = stored ? JSON.parse(stored) : { words: [] };

      const wordIndex = state.words.findIndex((w) => w.id === wordId);
      if (wordIndex >= 0) {
        // Update existing word
        const word = state.words[wordIndex];
        const newSuccessCount = isCorrect ? (word.successCount || 0) + 1 : 0;
        const newFailureCount = isCorrect
          ? word.failureCount || 0
          : (word.failureCount || 0) + 1;

        let newEaseFactor = word.easeFactor || INITIAL_EASE_FACTOR;
        if (!isCorrect) {
          newEaseFactor = Math.max(MIN_EASE_FACTOR, newEaseFactor - 0.2);
        }

        const interval = calculateNextInterval(newSuccessCount, newEaseFactor);
        const nextReview = new Date(
          now.getTime() + interval * 24 * 60 * 60 * 1000
        );

        state.words[wordIndex] = {
          ...word,
          successCount: newSuccessCount,
          failureCount: newFailureCount,
          easeFactor: newEaseFactor,
          lastReviewed: now,
          nextReview: nextReview
        };
      } else {
        // Add new word
        const interval = isCorrect
          ? calculateNextInterval(1, INITIAL_EASE_FACTOR)
          : 1;
        state.words.push({
          id: wordId,
          successCount: isCorrect ? 1 : 0,
          failureCount: isCorrect ? 0 : 1,
          easeFactor: INITIAL_EASE_FACTOR,
          lastReviewed: now,
          nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000)
        });
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));

      // Sync with backend if user is logged in
      if (userId) {
        try {
          // Try API service first, then fallback to direct fetch
          await apiUpdateWordProgress(userId, wordId, isCorrect);

          // Also try direct fetch as fallback
          await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/exercises/word-progress`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, wordId, isCorrect })
            }
          );
        } catch (err) {
          console.log("Failed to sync with backend:", err);
        }
      }
    },
    [userId]
  );

  // Get statistics
  const getStats = useCallback(() => {
    const now = new Date();

    const dueNow = wordsForReview.filter((w) => {
      if (!w.nextReview) return true;
      return new Date(w.nextReview) <= now;
    });

    const mastered = wordsForReview.filter((w) => (w.successCount || 0) >= 5);
    const learning = wordsForReview.filter(
      (w) => (w.successCount || 0) < 5 && (w.successCount || 0) > 0
    );
    const newWords = wordsForReview.filter((w) => !w.successCount);

    return {
      totalWords: wordsForReview.length,
      dueNow: dueNow.length,
      mastered: mastered.length,
      learning: learning.length,
      newWords: newWords.length
    };
  }, [wordsForReview]);

  // Load on mount
  useEffect(() => {
    fetchWordsForReview();
  }, [fetchWordsForReview]);

  return {
    wordsForReview,
    isLoading,
    error,
    lastSync,
    fetchWordsForReview,
    recordAnswer,
    getStats,
    calculateNextInterval,
    formatNextReview
  };
};

export default useSpacedRepetition;
