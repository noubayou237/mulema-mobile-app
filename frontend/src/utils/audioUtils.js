import { Audio } from "expo-av";

const DEFAULT_AUDIO_MODE = {
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
};

/**
 * Wraps Audio.setAudioModeAsync to silently swallow the "Unable to activate
 * keep awake" error thrown by expo-keep-awake on some devices/simulators.
 * Audio playback still works correctly without keep-awake being active.
 */
export async function setAudioMode(options = DEFAULT_AUDIO_MODE) {
  try {
    await Audio.setAudioModeAsync(options);
  } catch (err) {
    const msg = String(err?.message ?? "").toLowerCase();
    if (msg.includes("keep awake")) return;
    throw err;
  }
}

/**
 * Play a remote audio URL once and auto-unload when done.
 * Returns the Sound instance so callers can unload early if needed.
 */
export async function playAudioUrl(url) {
  if (!url) return null;
  await setAudioMode();
  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true, volume: 1.0 }
  );
  sound.setOnPlaybackStatusUpdate((status) => {
    if (status.didJustFinish) sound.unloadAsync();
  });
  return sound;
}
