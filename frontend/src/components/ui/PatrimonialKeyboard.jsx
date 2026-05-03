/**
 * PatrimonialKeyboard
 *
 * Full custom keyboard for Cameroonian patrimonial languages (Bassa, Duala, Ghomala).
 * Replaces the system keyboard — set showSoftInputOnFocus={false} on the TextInput.
 *
 * Two layers:
 *  • "patrimonial" (default) — special consonants + accented vowels in a grid
 *  • "qwerty"                — standard Latin QWERTY + numerals
 *
 * Props:
 *  value        {string}   current text value
 *  onChangeText {Function} called with new string on every keypress
 *  onSubmit     {Function} called when the submit (↵) key is pressed
 *  langName     {string}   active patrimonial language name
 *  disabled     {boolean}  prevents input when true (e.g. during feedback)
 */

import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SW } = Dimensions.get("window");

// ── Character sets per language ───────────────────────────────────────────────
const LANG_CHARS = {
  bassa: {
    consonants: [
      "ŋ", "Ŋ", "ɓ", "Ɓ", "ɛ", "Ɛ", "ɔ", "Ɔ", "ɲ", "Ɲ", "ǹ", "Ǹ",
    ],
    vowels: [
      { base: "a", variants: ["à", "á", "â", "ǎ"] },
      { base: "e", variants: ["è", "é", "ê", "ě"] },
      { base: "i", variants: ["ì", "í", "î", "ǐ"] },
      { base: "o", variants: ["ò", "ó", "ô", "ǒ"] },
      { base: "u", variants: ["ù", "ú", "û", "ǔ"] },
    ],
    other: ["ʼ", "-", ".", ",", "!"],
  },
  duala: {
    consonants: [
      "ɓ", "Ɓ", "ɛ", "Ɛ", "ɔ", "Ɔ", "ŋ", "Ŋ", "ɲ", "Ɲ",
    ],
    vowels: [
      { base: "a", variants: ["á", "â", "ā"] },
      { base: "e", variants: ["é", "ê", "ē"] },
      { base: "i", variants: ["í", "î", "ī"] },
      { base: "o", variants: ["ó", "ô", "ō"] },
      { base: "u", variants: ["ú", "û", "ū"] },
    ],
    other: ["ʼ", "ʻ", "-", ".", ","],
  },
  ghomala: {
    consonants: [
      "ŋ", "Ŋ", "ɛ", "Ɛ", "ɔ", "Ɔ", "ə", "Ə",
    ],
    vowels: [
      { base: "a", variants: ["á", "â", "ǎ"] },
      { base: "e", variants: ["é", "ê", "ě"] },
      { base: "i", variants: ["í", "î", "ǐ"] },
      { base: "o", variants: ["ó", "ô", "ǒ"] },
      { base: "u", variants: ["ú", "û", "ǔ"] },
    ],
    other: ["ʼ", "ʻ", "-", ".", ","],
  },
};

const QWERTY_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];
const NUMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function resolveLangKey(langName = "") {
  const n = langName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (n.includes("bassa") || n.includes("basaa")) return "bassa";
  if (n.includes("duala") || n.includes("douala")) return "duala";
  if (n.includes("ghomala") || n.includes("bamilek")) return "ghomala";
  return "bassa";
}

// ── Individual key button ─────────────────────────────────────────────────────
function Key({ char, label, onPress, style, textStyle, disabled }) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.55}
      style={[kb.key, style, disabled && kb.keyDisabled]}
    >
      <Text style={[kb.keyTxt, textStyle]} numberOfLines={1} adjustsFontSizeToFit>
        {label ?? char}
      </Text>
    </TouchableOpacity>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PatrimonialKeyboard({
  value = "",
  onChangeText,
  onSubmit,
  langName = "Bassa",
  disabled = false,
}) {
  const [layer, setLayer] = useState("patrimonial"); // "patrimonial" | "qwerty"
  const [caps, setCaps] = useState(false);

  const langKey = resolveLangKey(langName);
  const { consonants, vowels, other } = LANG_CHARS[langKey];

  const insert = (char) => {
    if (disabled) return;
    onChangeText(value + char);
  };
  const backspace = () => {
    if (disabled) return;
    onChangeText(value.slice(0, -1));
  };
  const space = () => insert(" ");

  // ── QWERTY layer ──────────────────────────────────────────────
  if (layer === "qwerty") {
    return (
      <View style={kb.wrap}>
        {/* Header */}
        <View style={kb.header}>
          <TouchableOpacity onPress={() => setLayer("patrimonial")} style={kb.headerBtn}>
            <Text style={kb.headerBtnTxt}>🌐 {langName}</Text>
          </TouchableOpacity>
          <Text style={kb.headerTitle}>LATIN</Text>
          <TouchableOpacity onPress={backspace} style={kb.headerBtn}>
            <Ionicons name="backspace-outline" size={18} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Numbers */}
        <View style={kb.row}>
          {NUMS.map((k) => (
            <Key key={k} char={k} onPress={() => insert(k)} style={kb.numKey} disabled={disabled} />
          ))}
        </View>

        {/* QWERTY rows */}
        {QWERTY_ROWS.map((row, ri) => (
          <View key={ri} style={kb.row}>
            {ri === 2 && (
              <TouchableOpacity
                onPress={() => setCaps((c) => !c)}
                style={[kb.key, kb.specialKey, caps && kb.capsActive]}
                activeOpacity={0.65}
              >
                <Ionicons
                  name={caps ? "arrow-up-circle" : "arrow-up-outline"}
                  size={18}
                  color={caps ? "#FFFFFF" : "#374151"}
                />
              </TouchableOpacity>
            )}
            {row.map((k) => {
              const ch = caps ? k.toUpperCase() : k;
              return (
                <Key key={k} char={ch} onPress={() => insert(ch)} style={kb.letterKey} disabled={disabled} />
              );
            })}
            {ri === 2 && (
              <TouchableOpacity onPress={backspace} style={[kb.key, kb.specialKey]} activeOpacity={0.65}>
                <Ionicons name="backspace-outline" size={18} color="#374151" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Bottom row */}
        <View style={kb.row}>
          <Key char="." onPress={() => insert(".")} style={kb.punctKey} disabled={disabled} />
          <Key char=" " label="ESPACE" onPress={space} style={kb.spaceKey} textStyle={kb.spaceTxt} disabled={disabled} />
          <TouchableOpacity
            onPress={disabled ? undefined : onSubmit}
            style={[kb.key, kb.submitKey, disabled && kb.keyDisabled]}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Patrimonial layer ─────────────────────────────────────────
  return (
    <View style={kb.wrap}>
      {/* Header */}
      <View style={kb.header}>
        <TouchableOpacity onPress={() => setLayer("qwerty")} style={kb.headerBtn}>
          <Text style={kb.headerBtnTxt}>ABC Latin</Text>
        </TouchableOpacity>
        <Text style={kb.headerTitle}>{langName.toUpperCase()}</Text>
        <TouchableOpacity onPress={backspace} style={kb.headerBtn}>
          <Ionicons name="backspace-outline" size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Special consonants — horizontal scroll */}
      <View style={kb.sectionWrap}>
        <Text style={kb.sectionLabel}>Consonnes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={kb.consonantRow}
          keyboardShouldPersistTaps="always"
        >
          {consonants.map((ch) => (
            <Key
              key={ch}
              char={ch}
              onPress={() => insert(ch)}
              style={kb.consonantKey}
              textStyle={kb.consonantTxt}
              disabled={disabled}
            />
          ))}
        </ScrollView>
      </View>

      <View style={kb.divider} />

      {/* Vowel grid — base letter + 4 tonal variants in each row */}
      <View style={kb.sectionWrap}>
        <Text style={kb.sectionLabel}>Voyelles accentuées</Text>
        {vowels.map(({ base, variants }) => (
          <View key={base} style={kb.vowelRow}>
            <View style={kb.vowelBaseWrap}>
              <Text style={kb.vowelBase}>{base}</Text>
            </View>
            {variants.map((v) => (
              <Key
                key={v}
                char={v}
                onPress={() => insert(v)}
                style={kb.vowelKey}
                textStyle={kb.vowelTxt}
                disabled={disabled}
              />
            ))}
            <View style={kb.vowelSpacer} />
          </View>
        ))}
      </View>

      <View style={kb.divider} />

      {/* Other chars + controls */}
      <View style={kb.row}>
        {other.map((ch) => (
          <Key
            key={ch}
            char={ch}
            onPress={() => insert(ch)}
            style={kb.otherKey}
            disabled={disabled}
          />
        ))}
        <View style={{ flex: 1 }} />
        <Key char=" " label="ESPACE" onPress={space} style={kb.spaceKey} textStyle={kb.spaceTxt} disabled={disabled} />
        <TouchableOpacity
          onPress={disabled ? undefined : onSubmit}
          style={[kb.key, kb.submitKey, disabled && kb.keyDisabled]}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const KEY_H  = 40;
const RADIUS = 6;
const KEY_SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.5,
  },
  android: { elevation: 2 },
});

const kb = StyleSheet.create({
  wrap: {
    backgroundColor: "#CDD4DE",
    paddingHorizontal: 6,
    paddingTop: 4,
    paddingBottom: Platform.OS === "ios" ? 18 : 8,
    borderTopWidth: 0.5,
    borderTopColor: "#A9B4C2",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    ...KEY_SHADOW,
  },
  headerBtnTxt: { fontSize: 12, fontWeight: "600", color: "#374151" },
  headerTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 1,
  },

  // Section labels
  sectionWrap: { marginBottom: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingHorizontal: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#B8C1CC",
    marginVertical: 5,
  },

  // Rows
  row: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },

  consonantRow: {
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 2,
    alignItems: "center",
  },
  vowelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 3,
  },
  vowelBaseWrap: {
    width: 22,
    alignItems: "center",
  },
  vowelBase: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  vowelSpacer: { flex: 1 },

  // Key base style
  key: {
    height: KEY_H,
    borderRadius: RADIUS,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    ...KEY_SHADOW,
  },
  keyDisabled: { opacity: 0.45 },
  keyTxt: {
    fontSize: 17,
    fontWeight: "500",
    color: "#111827",
    includeFontPadding: false,
  },

  // Specific key variants
  consonantKey: {
    width: 44,
    backgroundColor: "#F0F4FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
  },
  consonantTxt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  vowelKey: {
    width: 42,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  vowelTxt: {
    fontSize: 18,
    fontWeight: "600",
    color: "#14532D",
  },

  otherKey: {
    width: 42,
    backgroundColor: "#FAFAFA",
  },

  letterKey: {
    flex: 1,
    maxWidth: 42,
    minWidth: 28,
  },
  numKey: {
    flex: 1,
    maxWidth: 38,
    minWidth: 28,
  },
  punctKey: {
    width: 38,
    backgroundColor: "#E5E7EB",
  },

  specialKey: {
    width: 44,
    backgroundColor: "#9CA3AF",
  },
  capsActive: {
    backgroundColor: "#B71C1C",
  },

  spaceKey: {
    flex: 1,
    maxWidth: 160,
    backgroundColor: "#FFFFFF",
  },
  spaceTxt: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    letterSpacing: 1,
  },

  submitKey: {
    width: 60,
    backgroundColor: "#B71C1C",
    borderRadius: RADIUS,
    ...KEY_SHADOW,
  },
});
