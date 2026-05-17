import { Audio } from "expo-av";
import { AUDIOS_MAP } from "./AssetsMap";
import Logger from "./logger";
import { Alert } from "react-native";
import i18n from "../i18n";

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
    Logger.warn("[AudioUtils] No URL/Key provided to playAudioUrl");
    return;
  }

  try {
    // 1. Ensure audio mode is set (crucial for iOS silent mode and Android volume)
    await setAudioMode();

    // 2. Resolve source (local require or remote URI)
    const source = AUDIOS_MAP[url] ? AUDIOS_MAP[url] : { uri: url };

    if (!AUDIOS_MAP[url] && !url.startsWith("http")) {
      Logger.warn(`[AudioUtils] Key "${url}" not found in AUDIOS_MAP and doesn't look like a URL.`);
      // If it's a missing local key, we might want to skip createAsync to avoid crash logs, 
      // but catching the error below is more robust.
    }

    // 3. Create and play the sound
    const { sound } = await Audio.Sound.createAsync(
      source,
      { shouldPlay: true, volume: 1.0 },
      (status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      }
    );

    return sound;
  } catch (error) {
    Logger.error("playAudioUrl failed", error);
    
    // Show user-friendly error if audio fails
    const title = i18n.t("errors.audioError");
    const message = i18n.t("errors.audioNotAvailable");
    
    Alert.alert(title, message, [{ text: "OK" }], { cancelable: true });
    
    return null; // Return null so callers can handle failure if needed
  }
}
