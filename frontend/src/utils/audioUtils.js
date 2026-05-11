import { Audio } from "expo-av";
import { AUDIOS_MAP } from "./AssetsMap";
import Logger from "./logger";

const DEFAULT_AUDIO_MODE = {
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  staysActiveInBackground: false,
  playThroughEarpieceAndroid: false,
};

/**
 * Configure global audio mode.
 */
export async function setAudioMode(options = DEFAULT_AUDIO_MODE) {
  try {
    await Audio.setAudioModeAsync(options);
    console.log("[AudioUtils] Audio mode configured successfully");
  } catch (error) {
    Logger.error("Failed to set audio mode", error);
  }
}

/**
 * Play a local or remote audio asset.
 * @param {string} url - Key from AUDIOS_MAP or remote URI
 */
export async function playAudioUrl(url) {
  if (!url) {
    console.warn("[AudioUtils] No URL/Key provided to playAudioUrl");
    return;
  }

  try {
    // 1. Ensure audio mode is set (crucial for iOS silent mode and Android volume)
    await setAudioMode();

    // 2. Resolve source (local require or remote URI)
    const source = AUDIOS_MAP[url] ? AUDIOS_MAP[url] : { uri: url };
    console.log(`[AudioUtils] Attempting to play: ${url}`, source);

    if (!AUDIOS_MAP[url] && !url.startsWith("http")) {
      console.warn(`[AudioUtils] Key "${url}" not found in AUDIOS_MAP and doesn't look like a URL.`);
    }

    // 3. Create and play the sound
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, volume: 1.0 },
      (status) => {
        if (status.didJustFinish) {
          console.log(`[AudioUtils] Finished playing: ${url}`);
          sound.unloadAsync();
        }
      }
    );

    return sound;
  } catch (error) {
    console.error(`[AudioUtils] CRITICAL AUDIO ERROR for "${url}":`, error);
    Logger.error("playAudioUrl failed", error);
  }
}
