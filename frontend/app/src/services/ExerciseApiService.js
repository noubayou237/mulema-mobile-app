/**
 * Exercise API Service
 *
 * Handles communication with the backend exercise engine API.
<<<<<<< HEAD
 * Uses the centralized API client with automatic auth token handling.
=======
>>>>>>> feat/settings-page
 *
 * API Endpoints:
 * - GET /exercises/block/:blockId/generate - Generate exercises for a block
 * - GET /exercises/theme/:themeId/generate - Generate exercises for a theme
 * - GET /exercises/review/:userId - Get words for spaced repetition review
 * - POST /exercises/word-progress - Update word progress (SM-2)
 * - POST /exercises - Create new exercise session
 * - PATCH /exercises/:id/complete - Complete an exercise
 */

<<<<<<< HEAD
import api from '../../../services/api';
=======
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error.message);
    throw error;
  }
};
>>>>>>> feat/settings-page

/**
 * Generate exercises for a specific block
 *
 * @param {string} blockId - The ID of the learning block
 * @returns {Promise<Object>} Generated exercises
 */
export const generateBlockExercises = async (blockId) => {
<<<<<<< HEAD
  try {
    const response = await api.get(`/exercises/block/${blockId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating block exercises:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(
    `${API_BASE_URL}/exercises/block/${blockId}/generate`
  );
>>>>>>> feat/settings-page
};

/**
 * Generate exercises for a specific theme
 *
 * @param {string} themeId - The ID of the theme
 * @returns {Promise<Object>} Generated exercises
 */
export const generateThemeExercises = async (themeId) => {
<<<<<<< HEAD
  try {
    const response = await api.get(`/exercises/theme/${themeId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating theme exercises:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(
    `${API_BASE_URL}/exercises/theme/${themeId}/generate`
  );
>>>>>>> feat/settings-page
};

/**
 * Get words scheduled for review (spaced repetition)
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Words due for review
 */
export const getWordsForReview = async (userId) => {
<<<<<<< HEAD
  try {
    const response = await api.get(`/exercises/review/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review words:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(`${API_BASE_URL}/exercises/review/${userId}`);
>>>>>>> feat/settings-page
};

/**
 * Update word progress after an answer
 *
 * @param {string} userId - The user's ID
 * @param {string} wordId - The word's ID
 * @param {boolean} isCorrect - Whether the answer was correct
 * @returns {Promise<Object>} Updated progress
 */
export const updateWordProgress = async (userId, wordId, isCorrect) => {
<<<<<<< HEAD
  try {
    const response = await api.post('/exercises/word-progress', {
      userId,
      wordId,
      isCorrect
    });
    return response.data;
  } catch (error) {
    console.error('Error updating word progress:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(`${API_BASE_URL}/exercises/word-progress`, {
    method: "POST",
    body: JSON.stringify({ userId, wordId, isCorrect })
  });
>>>>>>> feat/settings-page
};

/**
 * Create a new exercise session
 *
 * @param {Object} exerciseData - Exercise session data
 * @returns {Promise<Object>} Created exercise
 */
export const createExercise = async (exerciseData) => {
<<<<<<< HEAD
  try {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(`${API_BASE_URL}/exercises`, {
    method: "POST",
    body: JSON.stringify(exerciseData)
  });
>>>>>>> feat/settings-page
};

/**
 * Complete an exercise session
 *
 * @param {string} exerciseId - The exercise's ID
 * @param {Object} completionData - Completion data (userId, accuracy, timeSpent)
 * @returns {Promise<Object>} Completion result
 */
export const completeExercise = async (exerciseId, completionData) => {
<<<<<<< HEAD
  try {
    const response = await api.patch(`/exercises/${exerciseId}/complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error completing exercise:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(
    `${API_BASE_URL}/exercises/${exerciseId}/complete`,
    {
      method: "PATCH",
      body: JSON.stringify(completionData)
    }
  );
>>>>>>> feat/settings-page
};

/**
 * Get exercise by ID
 *
 * @param {string} exerciseId - The exercise's ID
 * @returns {Promise<Object>} Exercise data
 */
export const getExercise = async (exerciseId) => {
<<<<<<< HEAD
  try {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(`${API_BASE_URL}/exercises/${exerciseId}`);
>>>>>>> feat/settings-page
};

/**
 * Get exercises for a lesson
 *
 * @param {string} lessonId - The lesson's ID
 * @returns {Promise<Array>} Exercises for the lesson
 */
export const getExercisesByLesson = async (lessonId) => {
<<<<<<< HEAD
  try {
    const response = await api.get(`/exercises/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by lesson:', error);
    throw error;
  }
=======
  return fetchWithErrorHandling(`${API_BASE_URL}/exercises/lesson/${lessonId}`);
>>>>>>> feat/settings-page
};

export default {
  generateBlockExercises,
  generateThemeExercises,
  getWordsForReview,
  updateWordProgress,
  createExercise,
  completeExercise,
  getExercise,
  getExercisesByLesson
};
