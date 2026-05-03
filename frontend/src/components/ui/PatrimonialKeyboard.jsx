/**
 * PatrimonialKeyboard
 *
 * Full custom keyboard for Cameroonian patrimonial languages (Bassa, Duala, Ghomala).
 * Replaces the system keyboard — set showSoftInputOnFocus={false} on the TextInput.
 *
 * Optimized for GACL (General Alphabet of Cameroon Languages).
 */

import { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SW } = Dimensions.get("window");

// ── Character sets per language ───────────────────────────────────────────────
const LANG_CHARS = {
  universal: {
    consonants: ["ɓ", "ɗ", "ŋ", "ɲ", "ƴ", "ʼ", "ɥ", "ǹ"],
    vowels: [
      { base: "a", variants: ["á", "à", "â", "ǎ", "ā"] },
      { base: "e", variants: ["é", "è", "ê", "ě", "ē"] },
      { base: "ɛ", variants: ["ɛ́", "ɛ̀", "ɛ̂", "ɛ̌", "ɛ̄"] },
      { base: "i", variants: ["í", "ì", "î", "ǐ", "ī"] },
      { base: "ɨ", variants: ["ɨ́", "ɨ̀", "ɨ̂", "ɨ̌", "ɨ̄"] },
      { base: "o", variants: ["ó", "ò", "ô", "ǒ", "ō"] },
      { base: "ɔ", variants: ["ɔ́", "ɔ̀", "ɔ̂", "ɔ̌", "ɔ̄"] },
      { base: "u", variants: ["ú", "ù", "û", "ǔ", "ū"] },
      { base: "ʉ", variants: ["ʉ́", "ʉ̀", "ʉ̂", "ʉ̌", "ʉ̄"] },
      { base: "ə", variants: ["ə́", "ə̀", "ə̂", "ə̌", "ə̄"] },
    ],
    tones: [
      { char: "\u0301", label: "◌́" }, // High
      { char: "\u0300", label: "◌̀" }, // Low
      { char: "\u0302", label: "◌̂" }, // Falling
      { char: "\u030C", label: "◌̌" }, // Rising
      { char: "\u0304", label: "◌̄" }, // Macron
      { char: "\u030D", label: "◌̍" }, // Vertical
    ],
    other: ["-", ".", ",", "!", "?", "(", ")"],
  },
  bassa: {
    consonants: ["ŋ", "ɓ", "ɲ", "ǹ", "ʼ"],
    vowels: [
      { base: "a", variants: ["á", "à", "â", "ǎ", "ā"] },
      { base: "e", variants: ["é", "è", "ê", "ě", "ē"] },
      { base: "ɛ", variants: ["ɛ́", "ɛ̀", "ɛ̂", "ɛ̌", "ɛ̄"] },
      { base: "i", variants: ["í", "ì", "î", "ǐ", "ī"] },
      { base: "o", variants: ["ó", "ò", "ô", "ǒ", "ō"] },
      { base: "ɔ", variants: ["ɔ́", "ɔ̀", "ɔ̂", "ɔ̌", "ɔ̄"] },
      { base: "u", variants: ["ú", "ù", "û", "ǔ", "ū"] },
    ],
    tones: [
      { char: "\u0301", label: "◌́" },
      { char: "\u0300", label: "◌̀" },
      { char: "\u0302", label: "◌̂" },
      { char: "\u030C", label: "◌̌" },
      { char: "\u0304", label: "◌̄" },
    ],
    other: ["-", ".", ",", "!"],
  },
  duala: {
    consonants: ["ɓ", "ŋ", "ɲ", "ʼ"],
    vowels: [
      { base: "a", variants: ["á", "â", "ā"] },
      { base: "e", variants: ["é", "ê", "ē"] },
      { base: "ɛ", variants: ["ɛ́", "ɛ̂", "ɛ̄"] },
      { base: "i", variants: ["í", "î", "ī"] },
      { base: "o", variants: ["ó", "ô", "ō"] },
      { base: "ɔ", variants: ["ɔ́", "ɔ̂", "ɔ̄"] },
      { base: "u", variants: ["ú", "û", "ū"] },
    ],
    tones: [
      { char: "\u0301", label: "◌́" },
      { char: "\u0302", label: "◌̂" },
      { char: "\u0304", label: "◌̄" },
    ],
    other: ["-", ".", ","],
  },
  ghomala: {
    consonants: ["ŋ", "ʼ", "ɥ"],
    vowels: [
      { base: "a", variants: ["á", "à", "â", "ǎ", "ā"] },
      { base: "e", variants: ["é", "è", "ê", "ě", "ē"] },
      { base: "ɛ", variants: ["ɛ́", "ɛ̀", "ɛ̂", "ɛ̌", "ɛ̄"] },
      { base: "i", variants: ["í", "ì", "î", "ǐ", "ī"] },
      { base: "o", variants: ["ó", "ò", "ô", "ǒ", "ō"] },
      { base: "ɔ", variants: ["ɔ́", "ɔ̀", "ɔ̂", "ɔ̌", "ɔ̄"] },
      { base: "u", variants: ["ú", "ù", "û", "ǔ", "ū"] },
      { base: "ə", variants: ["ə́", "ə̀", "ə̂", "ə̌", "ə̄"] },
      { base: "ʉ", variants: ["ʉ́", "ʉ̀", "ʉ̂", "ʉ̌", "ʉ̄"] },
    ],
    tones: [
      { char: "\u0301", label: "◌́" },
      { char: "\u0300", label: "◌̀" },
      { char: "\u0302", label: "◌̂" },
      { char: "\u030C", label: "◌̌" },
    ],
    other: ["-", ".", ","],
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
  if (n.includes("universal") || n.includes("cameroon") || n.includes("patrimonial")) return "universal";
  if (n.includes("bassa") || n.includes("basaa")) return "bassa";
  if (n.includes("duala") || n.includes("douala")) return "duala";
  if (n.includes("ghomala") || n.includes("bamilek")) return "ghomala";
  return "universal";
}

// ── Individual key button ─────────────────────────────────────────────────────
function Key({ char, label, onPress, style, textStyle, disabled, variant }) {
  const isSpecial = variant === "special";
  const isVowel = variant === "vowel";
  const isTone = variant === "tone";

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.55}
      style={[
        kb.key,
        isSpecial && kb.keySpecial,
        isVowel && kb.keyVowel,
        isTone && kb.keyTone,
        style,
        disabled && kb.keyDisabled,
      ]}
    >
      <Text
        style={[
          kb.keyTxt,
          isSpecial && kb.keyTxtSpecial,
          isVowel && kb.keyTxtVowel,
          isTone && kb.keyTxtTone,
          textStyle,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
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
  langName = "Patrimonial",
  disabled = false,
}) {
  const [layer, setLayer] = useState("patrimonial");
  const [caps, setCaps] = useState(false);

  const langKey = resolveLangKey(langName);
  const activeLang = LANG_CHARS[langKey] || LANG_CHARS.universal;
  const { consonants, vowels, tones, other } = activeLang;

  const insert = (char) => {
    if (disabled) return;
    onChangeText(value + char);
  };
  const backspace = () => {
    if (disabled) return;
    onChangeText(value.slice(0, -1));
  };
  const space = () => insert(" ");
  const toggleCaps = () => setCaps(!caps);

  // ── QWERTY layer ──────────────────────────────────────────────
  if (layer === "qwerty") {
    return (
      <View style={[kb.wrap, kb.darkWrap]}>
        <View style={kb.header}>
          <TouchableOpacity onPress={() => setLayer("patrimonial")} style={kb.headerBtn}>
            <Text style={kb.headerBtnTxt}>🌐 SPECIAL</Text>
          </TouchableOpacity>
          <Text style={kb.headerTitle}>LATIN QWERTY</Text>
          <TouchableOpacity onPress={backspace} style={kb.headerBtn}>
            <Ionicons name="backspace" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={kb.row}>
          {NUMS.map((k) => (
            <Key key={k} char={k} onPress={() => insert(k)} style={kb.numKey} disabled={disabled} />
          ))}
        </View>

        {QWERTY_ROWS.map((row, ri) => (
          <View key={ri} style={kb.row}>
            {ri === 2 && (
              <TouchableOpacity
                onPress={toggleCaps}
                style={[kb.key, kb.utilKey, caps && kb.capsActive]}
              >
                <Ionicons name="arrow-up" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
            {row.map((k) => {
              const ch = caps ? k.toUpperCase() : k;
              return (
                <Key key={k} char={ch} onPress={() => insert(ch)} style={kb.letterKey} disabled={disabled} />
              );
            })}
            {ri === 2 && (
              <TouchableOpacity onPress={backspace} style={[kb.key, kb.utilKey]}>
                <Ionicons name="backspace" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={kb.row}>
          <Key char="." onPress={() => insert(".")} style={kb.utilKeySm} disabled={disabled} />
          <Key char=" " label="ESPACE" onPress={space} style={kb.spaceKey} textStyle={kb.spaceTxt} disabled={disabled} />
          <TouchableOpacity
            onPress={disabled ? undefined : onSubmit}
            style={[kb.key, kb.submitKey]}
          >
            <Ionicons name="checkmark-done" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Patrimonial layer ─────────────────────────────────────────
  return (
    <View style={[kb.wrap, kb.darkWrap]}>
      {/* Header */}
      <View style={kb.header}>
        <TouchableOpacity onPress={() => setLayer("qwerty")} style={kb.headerBtn}>
          <Text style={kb.headerBtnTxt}>ABC LATIN</Text>
        </TouchableOpacity>

        <View style={kb.headerCenter}>
          <Text style={kb.headerTitle}>{langName.toUpperCase()}</Text>
          <View style={kb.langBadge}>
            <Text style={kb.langBadgeTxt}>GACL PRO</Text>
          </View>
        </View>

        <TouchableOpacity onPress={toggleCaps} style={[kb.headerBtn, caps && kb.capsActive]}>
          <Ionicons name="arrow-up" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tones Row — Essential for custom accenting */}
      <View style={kb.toneRow}>
        {tones.map((t) => (
          <Key
            key={t.char}
            char={t.char}
            label={t.label}
            onPress={() => insert(t.char)}
            variant="tone"
            disabled={disabled}
          />
        ))}
        <TouchableOpacity onPress={backspace} style={[kb.key, kb.utilKey, { width: 50, marginLeft: 10 }]}>
          <Ionicons name="backspace" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Consonants Grid */}
      <View style={kb.consonantGrid}>
        {consonants.map((baseCh) => {
          const ch = caps ? baseCh.toUpperCase() : baseCh;
          return (
            <Key
              key={baseCh}
              char={ch}
              onPress={() => insert(ch)}
              variant="special"
              style={kb.gridKey}
              disabled={disabled}
            />
          );
        })}
      </View>

      {/* Vowel Scroll Section */}
      <View style={kb.vowelSection}>
        <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator={false}>
          {vowels.map(({ base, variants }) => (
            <View key={base} style={kb.vowelStrip}>
              <TouchableOpacity
                onPress={() => insert(caps ? base.toUpperCase() : base)}
                style={kb.vowelMain}
              >
                <Text style={kb.vowelMainTxt}>{caps ? base.toUpperCase() : base}</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={kb.variantList}>
                {variants.map((v) => {
                  const char = caps ? v.toUpperCase() : v;
                  return (
                    <Key
                      key={v}
                      char={char}
                      onPress={() => insert(char)}
                      variant="vowel"
                      style={kb.variantKey}
                      disabled={disabled}
                    />
                  );
                })}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Bottom row */}
      <View style={kb.row}>
        {other.slice(0, 3).map((ch) => (
          <Key key={ch} char={ch} onPress={() => insert(ch)} style={kb.utilKeySm} disabled={disabled} />
        ))}
        <Key char=" " label="ESPACE" onPress={space} style={kb.spaceKey} textStyle={kb.spaceTxt} disabled={disabled} />
        <TouchableOpacity
          onPress={disabled ? undefined : onSubmit}
          style={[kb.key, kb.submitKey]}
        >
          <Ionicons name="checkmark-done" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const kb = StyleSheet.create({
  wrap: {
    paddingHorizontal: 6,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#333",
    ...Platform.select({
      ios: { paddingBottom: 40 },
      android: { paddingBottom: 20 },
    }),
  },
  darkWrap: {
    backgroundColor: "#0D0D0D", // Deeper black for premium look
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  headerBtnTxt: {
    color: "#EEE",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: "rgba(183, 28, 28, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  langBadge: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  langBadgeTxt: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 8,
  },

  // Specialized Key Styles
  key: {
    height: 52,
    backgroundColor: "#222",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: { elevation: 6 },
    }),
  },
  keyDisabled: { opacity: 0.3 },
  keyTxt: {
    color: "#F5F5F5",
    fontSize: 22,
    fontWeight: "600",
  },

  // Key Variants
  keySpecial: {
    backgroundColor: "#2A2A2A",
    borderColor: "#444",
  },
  keyTxtSpecial: {
    color: "#FFC107", // Vivid Amber
    fontWeight: "900",
  },
  keyVowel: {
    backgroundColor: "#1B2E1B",
    borderColor: "#2D4B2D",
  },
  keyTxtVowel: {
    color: "#81C784",
  },
  keyTone: {
    width: 48,
    height: 48,
    backgroundColor: "#1E272E",
    borderWidth: 1,
    borderColor: "#34495E",
  },
  keyTxtTone: {
    fontSize: 26,
    color: "#54A0FF",
  },

  // Layouts
  toneRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    marginHorizontal: 4,
  },
  consonantGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  gridKey: {
    width: (SW - 70) / 5,
  },

  vowelSection: {
    backgroundColor: "#080808",
    borderRadius: 20,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  vowelStrip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#151515",
    paddingBottom: 8,
  },
  vowelMain: {
    width: 40,
    alignItems: "center",
  },
  vowelMainTxt: {
    color: "#444",
    fontSize: 24,
    fontWeight: "900",
  },
  variantList: {
    gap: 10,
    paddingLeft: 12,
  },
  variantKey: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },

  // Utils
  utilKey: {
    backgroundColor: "#333",
    flex: 1,
    maxWidth: 52,
    borderColor: "#444",
  },
  utilKeySm: {
    width: 44,
    backgroundColor: "#222",
  },
  letterKey: {
    flex: 1,
    maxWidth: (SW - 110) / 10,
    height: 44,
  },
  numKey: {
    flex: 1,
    maxWidth: (SW - 60) / 10,
    height: 38,
    backgroundColor: "#1A1A1A",
  },
  capsActive: {
    backgroundColor: "#D32F2F",
    borderColor: "#FF5252",
  },
  spaceKey: {
    flex: 3,
    backgroundColor: "#2A2A2A",
    borderColor: "#333",
  },
  spaceTxt: {
    fontSize: 12,
    color: "#666",
    fontWeight: "900",
    letterSpacing: 3,
  },
  submitKey: {
    flex: 1,
    backgroundColor: "#B71C1C",
    borderColor: "#E53935",
    maxWidth: 90,
  },
});

