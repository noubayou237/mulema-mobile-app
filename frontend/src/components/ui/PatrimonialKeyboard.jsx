import { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BRAND   = "#B71C1C";
const BG      = "#1A1A1A";
const KEY_BG  = "#2C2C2E";
const UTIL_BG = "#3D3D3F";

// Long-press variants (Latin and special layer)
const VARIANTS = {
  a: ["á", "à", "â", "ǎ", "ā"],
  e: ["é", "è", "ê", "ě", "ē"],
  i: ["í", "ì", "î", "ǐ", "ī", "ɨ"],
  o: ["ó", "ò", "ô", "ǒ", "ō"],
  u: ["ú", "ù", "û", "ǔ", "ū", "ʉ"],
  n: ["ŋ", "ɲ", "ǹ"],
  b: ["ɓ"],
  d: ["ɗ"],
  y: ["ƴ"],
  w: ["ɥ"],
  ɛ: ["ɛ́", "ɛ̀", "ɛ̂", "ɛ̌", "ɛ̄"],
  ɔ: ["ɔ́", "ɔ̀", "ɔ̂", "ɔ̌", "ɔ̄"],
  ə: ["ə́", "ə̀", "ə̂", "ə̌", "ə̄"],
  ʉ: ["ʉ́", "ʉ̀", "ʉ̂", "ʉ̌", "ʉ̄"],
  ɨ: ["ɨ́", "ɨ̀", "ɨ̂", "ɨ̌", "ɨ̄"],
};

const QWERTY = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

// Special layer: language-specific GACL chars in a 3-row grid
const SPECIAL = {
  bassa: [
    ["ŋ", "ɓ", "ɲ", "ǹ", "ʼ", "ɛ", "ɔ", "ɛ́", "ɔ́", "–"],
    ["ɛ̀", "ɔ̀", "ɛ̂", "ɔ̂", "á", "à", "â", "é", "è"],
    ["ê", "ě", "í", "ì", "î", "ó", "ò", "ô"],
  ],
  duala: [
    ["ɓ", "ŋ", "ɲ", "ʼ", "ɛ", "ɔ", "ɛ́", "ɛ̂", "ɛ̄", "ɔ́"],
    ["ɔ̂", "ɔ̄", "á", "â", "ā", "é", "ê", "ē", "í"],
    ["î", "ī", "ó", "ô", "ō", "ú", "û", "ū"],
  ],
  ghomala: [
    ["ŋ", "ʼ", "ɥ", "ɛ", "ɔ", "ə", "ʉ", "ɛ́", "ɛ̀", "ɔ́"],
    ["ɔ̀", "ə́", "ə̀", "ʉ́", "ʉ̀", "á", "à", "â", "ǎ"],
    ["ā", "é", "è", "ê", "ě", "ē", "ó", "ò"],
  ],
  universal: [
    ["ɓ", "ɗ", "ŋ", "ɲ", "ƴ", "ʼ", "ɥ", "ǹ", "ɨ", "ʉ"],
    ["ɛ", "ɔ", "ə", "á", "à", "â", "é", "è", "ê"],
    ["ó", "ò", "ô", "ú", "ù", "û", "í", "ì"],
  ],
};

function resolveLang(name = "") {
  const n = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (n.includes("bassa") || n.includes("basaa")) return "bassa";
  if (n.includes("duala") || n.includes("douala")) return "duala";
  if (n.includes("ghomala") || n.includes("bamilek")) return "ghomala";
  return "universal";
}

export default function PatrimonialKeyboard({
  value = "",
  onChangeText,
  onSubmit,
  langName = "",
  disabled = false,
}) {
  const [layer, setLayer]   = useState("latin");
  const [caps, setCaps]     = useState(false);
  const [popup, setPopup]   = useState(null); // string[] | null

  const lang = resolveLang(langName);
  const isSpecial = layer === "special";

  const put = useCallback((char) => {
    if (disabled) return;
    setPopup(null);
    const ch = (!isSpecial && caps) ? char.toUpperCase() : char;
    onChangeText(value + ch);
  }, [disabled, value, caps, isSpecial, onChangeText]);

  const del = useCallback(() => {
    if (disabled) return;
    setPopup(null);
    onChangeText([...value].slice(0, -1).join(""));
  }, [disabled, value, onChangeText]);

  const openVariants = useCallback((char) => {
    const v = VARIANTS[char.toLowerCase()] ?? VARIANTS[char];
    if (v?.length) setPopup(v);
  }, []);

  const rows = isSpecial ? (SPECIAL[lang] ?? SPECIAL.universal) : QWERTY;

  return (
    <View style={s.wrap}>

      {/* Variant popup — appears on long-press */}
      {popup && (
        <View style={s.popup}>
          {popup.map((v) => (
            <TouchableOpacity key={v} onPress={() => put(v)} activeOpacity={0.55} style={s.popKey}>
              <Text style={s.popTxt}>{v}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={() => setPopup(null)} style={s.popClose}>
            <Ionicons name="close" size={14} color="#888" />
          </TouchableOpacity>
        </View>
      )}

      {/* Rows 0–2 */}
      {rows.map((row, ri) => (
        <View key={ri} style={[s.row, ri === 1 && s.rowInset]}>
          {/* Row 2 left action */}
          {ri === 2 && (
            isSpecial
              ? <TouchableOpacity onPress={() => { setLayer("latin"); setPopup(null); }} style={[s.key, s.util]}>
                  <Text style={s.utilTxt}>ABC</Text>
                </TouchableOpacity>
              : <TouchableOpacity onPress={() => setCaps(c => !c)} style={[s.key, s.util, caps && s.capActive]}>
                  <Ionicons name="arrow-up" size={17} color={caps ? BRAND : "#CCC"} />
                </TouchableOpacity>
          )}

          {/* Letter keys */}
          {row.map((k) => {
            const display = (!isSpecial && caps) ? k.toUpperCase() : k;
            const hasV = !!(VARIANTS[k.toLowerCase()] ?? VARIANTS[k]);
            return (
              <TouchableOpacity
                key={k}
                onPress={() => put(k)}
                onLongPress={hasV ? () => openVariants(k) : undefined}
                delayLongPress={280}
                activeOpacity={0.55}
                style={[s.key, s.letter]}
              >
                <Text style={s.kTxt} numberOfLines={1} adjustsFontSizeToFit>
                  {display}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Row 2 right action */}
          {ri === 2 && (
            <TouchableOpacity onPress={del} style={[s.key, s.util]}>
              <Ionicons name="backspace-outline" size={19} color="#CCC" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Bottom row */}
      <View style={s.row}>
        {/* Globe / ABC toggle */}
        <TouchableOpacity
          onPress={() => { setLayer(l => l === "latin" ? "special" : "latin"); setPopup(null); }}
          style={[s.key, s.util]}
        >
          {isSpecial
            ? <Text style={s.utilTxt}>ABC</Text>
            : <Text style={s.globeEmoji}>🌐</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => put(",")} activeOpacity={0.55} style={[s.key, s.sm]}>
          <Text style={s.kTxt}>,</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => put(" ")} activeOpacity={0.55} style={[s.key, s.space]}>
          <Text style={s.spaceTxt}>space</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => put(".")} activeOpacity={0.55} style={[s.key, s.sm]}>
          <Text style={s.kTxt}>.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={disabled ? undefined : onSubmit}
          activeOpacity={0.55}
          style={[s.key, s.submit]}
        >
          <Ionicons name="return-down-back" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const shadow = Platform.select({
  ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.38, shadowRadius: 0 },
  android: { elevation: 2 },
});

const s = StyleSheet.create({
  wrap: {
    backgroundColor: BG,
    paddingTop: 8,
    paddingHorizontal: 3,
    paddingBottom: Platform.OS === "ios" ? 34 : 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#3A3A3A",
  },

  // Variant popup strip
  popup: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    backgroundColor: "#313131",
    borderRadius: 10,
    marginHorizontal: 4,
    marginBottom: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#505050",
  },
  popKey: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 5,
    backgroundColor: "#484848",
    minWidth: 36,
    alignItems: "center",
  },
  popTxt: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "400",
  },
  popClose: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 2,
  },

  // Rows
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 3,
  },
  rowInset: {
    paddingHorizontal: 24,
  },

  // Keys
  key: {
    height: 43,
    backgroundColor: KEY_BG,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  letter: {
    flex: 1,
  },
  kTxt: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "400",
  },

  // Utility keys (shift, backspace, ABC/globe)
  util: {
    backgroundColor: UTIL_BG,
    width: 44,
    flex: 0,
  },
  utilTxt: {
    color: "#DDD",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  capActive: {
    backgroundColor: "#505050",
  },

  // Bottom row special keys
  globeEmoji: {
    fontSize: 17,
  },
  sm: {
    width: 42,
  },
  space: {
    flex: 4,
  },
  spaceTxt: {
    color: "#888",
    fontSize: 14,
  },
  submit: {
    width: 86,
    backgroundColor: BRAND,
  },
});
