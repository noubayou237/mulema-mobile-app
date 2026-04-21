/**
 * MULEMA — useBackgroundMusic
 * Plays the app theme song on loop at low volume.
 * Pauses when app goes to background, resumes on foreground.
 */

import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { Audio } from "expo-av";
import { setAudioMode } from "../utils/audioUtils";

const SONG = require("../../assets/appthemesong/GENERIK MAKOUNE short.mp3.mpeg");
const VOLUME = 0.1; // gentle background level

let globalSound = null; // singleton so only one instance plays
let globalIsMuted = false;

export function useBackgroundMusic() {
  const [isMuted, setIsMuted] = useState(globalIsMuted);
  const appState = useRef(AppState.currentState);
  const soundRef = useRef(null);

  // Load and start music
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // Already playing globally — just reference it
      if (globalSound) {
        soundRef.current = globalSound;
        return;
      }

      try {
        await setAudioMode();

        const { sound } = await Audio.Sound.createAsync(SONG, {
          isLooping: true,
          volume: VOLUME,
          shouldPlay: true,
        });

        if (!mounted) {
          await sound.unloadAsync();
          return;
        }

        globalSound = sound;
        soundRef.current = sound;
      } catch (err) {
        console.warn("[BackgroundMusic] Could not load theme song:", err.message);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Pause/resume on app state change
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const sound = soundRef.current;
      if (!sound) return;

      if (appState.current === "active" && nextState.match(/inactive|background/)) {
        // App going to background — pause
        try { await sound.pauseAsync(); } catch {}
      } else if (appState.current.match(/inactive|background/) && nextState === "active") {
        // App coming to foreground — resume unless muted
        if (!isMuted && !globalIsMuted) {
          try { await sound.playAsync(); } catch {}
        }
      }
      appState.current = nextState;
    });

    return () => sub.remove();
  }, [isMuted]);

  const toggleMute = async () => {
    const sound = soundRef.current;
    if (!sound) return;
    try {
      if (isMuted) {
        await sound.setVolumeAsync(VOLUME);
        await sound.playAsync();
        setIsMuted(false);
        globalIsMuted = false;
      } else {
        await sound.setVolumeAsync(0);
        setIsMuted(true);
        globalIsMuted = true;
      }
    } catch (err) {
      console.warn("[BackgroundMusic] toggleMute error:", err.message);
    }
  };

  return { isMuted, toggleMute };
}

/** Call this to stop music permanently (e.g. when entering an exercise with audio) */
export async function pauseBackgroundMusic() {
  if (globalSound) {
    try { 
      await globalSound.setVolumeAsync(0);
      await globalSound.pauseAsync();
    } catch {}
  }
}

/** Resume after exercise ends */
export async function resumeBackgroundMusic() {
  if (globalSound && !globalIsMuted) {
    try {
      await globalSound.setVolumeAsync(VOLUME);
      await globalSound.playAsync();
    } catch {}
  }
}
