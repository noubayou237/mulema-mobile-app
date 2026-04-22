import { Audio } from "expo-av";
import { useTranslation } from "react-i18next";

// Sound objects storage
let correctSound = null;
let incorrectSound = null;
let wordSounds = {};

// Flag to track if audio is properly initialized
let audioInitialized = false;

// Flag to track if audio is disabled due to keep-awake error
let audioDisabled = false;

/**
 * Check if error is the keep-awake related error
 */
const isKeepAwakeError = (error) => {
  if (!error) return false;
  const message = error.message || String(error);
  return (
    message.includes("keep awake") ||
    message.includes("Unable to activate") ||
    message.includes("CodedError")
  );
};

let initializationPromise = null;

/**
 * Initialize audio with error handling for keep-awake issues
 * This function handles the "Unable to activate keep awake" error gracefully
 * and ensures only one initialization attempt happens at a time.
 */
const initializeAudio = async () => {
  if (audioInitialized) return true;
  if (audioDisabled) return false;

  // If already initializing, wait for it
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true
      });
      audioInitialized = true;
      console.log("[AudioService] Audio initialized successfully");
      return true;
    } catch (error) {
      if (isKeepAwakeError(error)) {
        console.warn("[AudioService] Keep awake not available, trying fallback...");
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: false
          });
          audioInitialized = true;
          return true;
        } catch (fallbackError) {
          console.warn("[AudioService] Audio fallback failed:", fallbackError.message);
          audioDisabled = true;
          return false;
        }
      }
      console.error("[AudioService] Error initializing audio:", error);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

// Initialize audio on module load (best effort)
initializeAudio().catch(() => {});

/**
 * Play a sound from a local asset
 * @param {object} soundObject - The loaded sound object
 * @returns {Promise<void>}
 */
const playSound = async (soundObject) => {
  try {
    if (soundObject) {
      await soundObject.setPositionAsync(0);
      await soundObject.playAsync();
    }
  } catch (error) {
    console.error("Error playing sound:", error);
    throw error;
  }
};

/**
 * Load a sound from a local asset
 * @param {number} asset - The asset module
 * @returns {Promise<object>}
 */
const loadSound = async (asset) => {
  // Return null if audio is disabled
  if (audioDisabled) {
    console.warn("Audio disabled due to previous errors");
    return null;
  }

  try {
    // Ensure audio is initialized before loading
    const initResult = await initializeAudio();
    if (!initResult) {
      console.warn("Audio initialization failed, skipping load");
      return null;
    }

    const { sound } = await Audio.Sound.createAsync(asset, {
      shouldPlay: false,
      shouldDuck: true
    });
    return sound;
  } catch (error) {
    // Handle keep awake error during sound loading
    if (isKeepAwakeError(error)) {
      console.warn(
        "Keep awake error during load, disabling audio:",
        error.message
      );
      audioDisabled = true;
      return null;
    }
    console.error("Error loading sound:", error);
    throw error;
  }
};

/**
 * Initialize validation sounds (correct/incorrect)
 * For now, we'll try to load from assets if they exist
 * Otherwise we'll use a fallback approach
 */
export const initializeValidationSounds = async () => {
  try {
    // Try to load validation sounds from assets
    // Note: These files would need to be added to the assets folder
    // For now, we'll set up the structure and handle missing files gracefully
    console.log("Validation sounds initialized");
  } catch (error) {
    console.log("Validation sounds not available:", error.message);
  }
};

/**
 * Play the correct answer sound
 * @param {string} language - 'en' or 'fr'
 */
export const playCorrectSound = async (language = "fr") => {
  try {
    // Try to load from assets first
    // Since we don't have specific correct/incorrect sounds, we'll create a workaround
    // by using available sounds or showing that audio feedback is not available

    // For now, we'll use haptic feedback as a fallback
    const { Haptics } = await import("expo-haptics");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log("Correct answer feedback - haptics used");
  } catch (error) {
    console.log("Error playing correct sound:", error.message);
  }
};

/**
 * Play the incorrect answer sound
 * @param {string} language - 'en' or 'fr'
 */
export const playIncorrectSound = async (language = "fr") => {
  try {
    // Use haptic feedback as a fallback
    const { Haptics } = await import("expo-haptics");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    console.log("Incorrect answer feedback - haptics used");
  } catch (error) {
    console.log("Error playing incorrect sound:", error.message);
  }
};

/**
 * Play audio for a specific word
 * @param {string} wordKey - Key to identify the word audio
 * @param {object} audioMap - Map of word keys to audio assets
 */
export const playWordAudio = async (wordKey, audioMap) => {
  try {
    if (!audioMap || !audioMap[wordKey]) {
      console.log(`Audio not found for word: ${wordKey}`);
      throw new Error(`Audio not found for word: ${wordKey}`);
    }

    // If not already loaded, load the sound
    if (!wordSounds[wordKey]) {
      wordSounds[wordKey] = await loadSound(audioMap[wordKey]);
    }

    await playSound(wordSounds[wordKey]);
  } catch (error) {
    console.error(`Error playing word audio for ${wordKey}:`, error.message);
    throw error;
  }
};

/**
 * Stop all currently playing sounds
 */
export const stopAllSounds = async () => {
  try {
    // Stop all word sounds
    for (const key in wordSounds) {
      if (wordSounds[key]) {
        await wordSounds[key].stopAsync();
      }
    }
  } catch (error) {
    console.error("Error stopping sounds:", error);
  }
};

/**
 * Unload all sounds to free memory
 */
export const cleanupSounds = async () => {
  try {
    // Unload word sounds
    for (const key in wordSounds) {
      if (wordSounds[key]) {
        await wordSounds[key].unloadAsync();
      }
    }
    wordSounds = {};
  } catch (error) {
    console.error("Error cleaning up sounds:", error);
  }
};

/**
 * Show error alert for audio failure
 * @param {string} message - Error message to display
 */
export const showAudioError = (message) => {
  const { Alert } = require("react-native");
  Alert.alert(
    "Audio Error",
    message || "Unable to play audio. Please try again.",
    [{ text: "OK" }]
  );
};

export default {
  initializeAudio,
  initializeValidationSounds,
  playCorrectSound,
  playIncorrectSound,
  playWordAudio,
  stopAllSounds,
  cleanupSounds,
  showAudioError
};
