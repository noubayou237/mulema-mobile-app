import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

// Different design styles for word display
const WORD_DESIGNS = [
  // Design 1: Default with gradient-like background
  {
    name: "default",
    containerStyle: {
      backgroundColor: "#E3F2FD",
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#2196F3"
    },
    textStyle: {
      color: "#1565C0",
      fontWeight: "600"
    }
  },
  // Design 2: Bold with shadow
  {
    name: "bold",
    containerStyle: {
      backgroundColor: "#FFF3E0",
      borderRadius: 20,
      borderWidth: 3,
      borderColor: "#FF9800",
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5
    },
    textStyle: {
      color: "#E65100",
      fontWeight: "800"
    }
  },
  // Design 3: Minimal
  {
    name: "minimal",
    containerStyle: {
      backgroundColor: "#E8F5E9",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#4CAF50"
    },
    textStyle: {
      color: "#2E7D32",
      fontWeight: "400"
    }
  },
  // Design 4: Rounded pill
  {
    name: "pill",
    containerStyle: {
      backgroundColor: "#FCE4EC",
      borderRadius: 50,
      borderWidth: 2,
      borderColor: "#EC407A"
    },
    textStyle: {
      color: "#C2185B",
      fontWeight: "700"
    }
  },
  // Design 5: Outlined
  {
    name: "outlined",
    containerStyle: {
      backgroundColor: "transparent",
      borderRadius: 15,
      borderWidth: 2,
      borderColor: "#7B1FA2"
    },
    textStyle: {
      color: "#7B1FA2",
      fontWeight: "600"
    }
  },
  // Design 6: Card style
  {
    name: "card",
    containerStyle: {
      backgroundColor: "#FFF",
      borderRadius: 10,
      borderWidth: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3
    },
    textStyle: {
      color: "#37474F",
      fontWeight: "500"
    }
  }
];

/**
 * SmartRepetition Component
 * - Displays words at least 10 times
 * - Shows words in different designs to strengthen memorization
 * - Supports rapid memorization through repeated exposure
 */
const SmartRepetition = ({
  words = [],
  onComplete,
  autoPlayInterval = 3000, // Time between each display (ms)
  showWordCount = 10 // Number of times to show each word
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Get current word
  const currentWord = words[currentWordIndex];

  // Get design for current display (cycles through designs)
  const getDesignForDisplay = (index) => {
    return WORD_DESIGNS[index % WORD_DESIGNS.length];
  };

  // Animation for word display
  const animateWord = () => {
    // Reset animations
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    rotateAnim.setValue(0);

    // Play haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );

    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  // Handle auto-play
  useEffect(() => {
    let interval;

    if (isPlaying && !isPaused && words.length > 0) {
      interval = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isPaused, currentWordIndex, displayCount, words.length]);

  // Handle word change animation
  useEffect(() => {
    if (currentWord && isPlaying) {
      animateWord();
    }
  }, [currentWordIndex, displayCount]);

  // Start auto-play
  const handlePlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
    if (currentWord) {
      animateWord();
    }
  };

  // Pause/Resume
  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  // Stop
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(0);
    setDisplayCount(0);
  };

  // Navigate to next word
  const handleNext = () => {
    const newDisplayCount = displayCount + 1;

    // Check if we've shown all words the required number of times
    if (newDisplayCount >= showWordCount * words.length) {
      // Completed all repetitions
      setIsPlaying(false);
      if (onComplete) {
        onComplete({
          totalWords: words.length,
          repetitionsPerWord: showWordCount,
          totalDisplayCount: newDisplayCount
        });
      }
      return;
    }

    // Move to next word
    const nextIndex = (currentWordIndex + 1) % words.length;
    setCurrentWordIndex(nextIndex);
    setDisplayCount(newDisplayCount);
  };

  // Navigate to previous word
  const handlePrevious = () => {
    const prevIndex = currentWordIndex - 1;
    if (prevIndex >= 0) {
      setCurrentWordIndex(prevIndex);
    } else {
      setCurrentWordIndex(words.length - 1);
    }
  };

  // Get current design
  const currentDesign = getDesignForDisplay(displayCount);

  // Calculate progress
  const totalDisplays = showWordCount * words.length;
  const progress = displayCount > 0 ? (displayCount / totalDisplays) * 100 : 0;

  // Calculate rotation for animation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "5deg"]
  });

  if (!words || words.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No words available for repetition</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {displayCount} / {totalDisplays}
        </Text>
      </View>

      {/* Word display area */}
      <View style={styles.displayArea}>
        {currentWord && (
          <Animated.View
            style={[
              styles.wordContainer,
              currentDesign.containerStyle,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }, { rotate: rotate }]
              }
            ]}
          >
            <View style={styles.wordContent}>
              <Text style={[styles.wordText, currentDesign.textStyle]}>
                {currentWord.local || currentWord}
              </Text>
              {currentWord.fr && (
                <Text style={styles.translationText}>{currentWord.fr}</Text>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Word counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          Mot {currentWordIndex + 1} sur {words.length}
        </Text>
        <Text style={styles.repeatText}>
          Répétition {Math.floor(displayCount / words.length) + 1} /{" "}
          {showWordCount}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {!isPlaying ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlay}
          >
            <Ionicons name='play' size={24} color='#FFF' />
            <Text style={styles.controlButtonText}>Commencer</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={handlePause}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={24}
                color='#FFF'
              />
              <Text style={styles.controlButtonText}>
                {isPaused ? "Reprendre" : "Pause"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Ionicons name='stop' size={24} color='#FFF' />
              <Text style={styles.controlButtonText}>Arrêter</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Navigation buttons (when paused or stopped) */}
      {!isPlaying && displayCount > 0 && (
        <View style={styles.navigationControls}>
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton]}
            onPress={handlePrevious}
          >
            <Ionicons name='chevron-back' size={20} color='#FFF' />
            <Text style={styles.navButtonText}>Précédent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.nextButton]}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Suivant</Text>
            <Ionicons name='chevron-forward' size={20} color='#FFF' />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    alignItems: "center"
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center"
  },
  emptyText: {
    color: "#999",
    fontSize: 16
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 5
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4
  },
  progressText: {
    textAlign: "center",
    color: "#666",
    fontSize: 12
  },
  displayArea: {
    width: "100%",
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20
  },
  wordContainer: {
    width: width * 0.7,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  wordContent: {
    alignItems: "center"
  },
  wordText: {
    fontSize: 28,
    textAlign: "center"
  },
  translationText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic"
  },
  counterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20
  },
  counterText: {
    fontSize: 14,
    color: "#666"
  },
  repeatText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600"
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 15
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8
  },
  playButton: {
    backgroundColor: "#4CAF50"
  },
  pauseButton: {
    backgroundColor: "#FF9800"
  },
  stopButton: {
    backgroundColor: "#F44336"
  },
  controlButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    gap: 5
  },
  prevButton: {
    backgroundColor: "#2196F3"
  },
  nextButton: {
    backgroundColor: "#2196F3"
  },
  navButtonText: {
    color: "#FFF",
    fontWeight: "500",
    fontSize: 14
  }
});

export default SmartRepetition;
