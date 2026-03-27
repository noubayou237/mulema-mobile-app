/**
 * Exercise API Service
 *
 * Handles communication with the backend exercise engine API.
 * Uses the centralized API client with automatic auth token handling.
 *
 * API Endpoints:
 * - GET /exercises/block/:blockId/generate - Generate exercises for a block
 * - GET /exercises/theme/:themeId/generate - Generate exercises for a theme
 * - GET /exercises/review/:userId - Get words for spaced repetition review
 * - POST /exercises/word-progress - Update word progress (SM-2)
 * - POST /exercises - Create new exercise session
 * - PATCH /exercises/:id/complete - Complete an exercise
 */

import api from '../../../src/services/api';

/**
 * Generate exercises for a specific block
 *
 * @param {string} blockId - The ID of the learning block
 * @returns {Promise<Object>} Generated exercises
 */
export const generateBlockExercises = async (blockId) => {
  try {
    const response = await api.get(`/exercises/block/${blockId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating block exercises:', error);
    throw error;
  }
};

/**
 * Generate exercises for a specific theme
 *
 * @param {string} themeId - The ID of the theme
 * @returns {Promise<Object>} Generated exercises
 */
export const generateThemeExercises = async (themeId) => {
  try {
    const response = await api.get(`/exercises/theme/${themeId}/generate`);
    return response.data;
  } catch (error) {
    console.error('Error generating theme exercises:', error);
    throw error;
  }
};

/**
 * Get words scheduled for review (spaced repetition)
 *
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Words due for review
 */
export const getWordsForReview = async (userId) => {
  try {
    const response = await api.get(`/exercises/review/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching review words:', error);
    throw error;
  }
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
};

/**
 * Create a new exercise session
 *
 * @param {Object} exerciseData - Exercise session data
 * @returns {Promise<Object>} Created exercise
 */
export const createExercise = async (exerciseData) => {
  try {
    const response = await api.post('/exercises', exerciseData);
    return response.data;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

/**
 * Complete an exercise session
 *
 * @param {string} exerciseId - The exercise's ID
 * @param {Object} completionData - Completion data (userId, accuracy, timeSpent)
 * @returns {Promise<Object>} Completion result
 */
export const completeExercise = async (exerciseId, completionData) => {
  try {
    const response = await api.patch(`/exercises/${exerciseId}/complete`, completionData);
    return response.data;
  } catch (error) {
    console.error('Error completing exercise:', error);
    throw error;
  }
};

/**
 * Get exercise by ID
 *
 * @param {string} exerciseId - The exercise's ID
 * @returns {Promise<Object>} Exercise data
 */
export const getExercise = async (exerciseId) => {
  try {
    const response = await api.get(`/exercises/${exerciseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw error;
  }
};

/**
 * Get exercises for a lesson
 *
 * @param {string} lessonId - The lesson's ID
 * @returns {Promise<Array>} Exercises for the lesson
 */
export const getExercisesByLesson = async (lessonId) => {
  try {
    const response = await api.get(`/exercises/lesson/${lessonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exercises by lesson:', error);
    throw error;
  }
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
