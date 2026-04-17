/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Reusable UI Components                             ║
 * ║  Import any component in any screen.                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage:
 *    import { MInput, MButton, MDivider, MSocialButton, MCulturalCard, MChip }
 *      from "@/components/ui/MComponents";
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Vibration,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, Typo, Space, Radius, Shadow } from "../../theme/tokens";

/* ══════════════════════════════════════════════════════════════
   MInput — Text field following the "No-Line" design rule
   ══════════════════════════════════════════════════════════════ */

export const MInput = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "none",
  rightIcon,
  onRightPress,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.01,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const borderColor = error
    ? Colors.error
    : focused
    ? Colors.primary
    : Colors.transparent;

  const bg = error
    ? Colors.errorContainer + "18"
    : focused
    ? Colors.surfaceContainerLow
    : Colors.surfaceContainerLow;

  return (
    <View style={{ marginBottom: Space.lg }}>
      {label && <Text style={[Typo.labelLg, { marginBottom: Space.sm }]}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: bg,
            borderColor,
            borderWidth: focused || error ? 1.5 : 0,
            transform: [{ scale: scaleAnim }],
          },
          focused && Shadow.sm,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? Colors.primary : Colors.textTertiary}
            style={{ marginRight: Space.md }}
          />
        )}
        <TextInput
          style={[styles.inputText, !icon && { paddingLeft: Space.xs }]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={focused ? Colors.primary : Colors.textTertiary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      {error && (
        <Text style={[Typo.bodySm, { color: Colors.error, marginTop: Space.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
};


/* ══════════════════════════════════════════════════════════════
   MButton — Primary / Secondary / Tertiary (ghost)
   ══════════════════════════════════════════════════════════════ */

export const MButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",    // "primary" | "secondary" | "tertiary"
  icon,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 15,
      useNativeDriver: true,
    }).start();
  };

  const isDisabled = disabled || loading;

  if (variant === "tertiary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
        style={[{ paddingVertical: Space.md }, style]}
      >
        <Text
          style={[
            Typo.titleSm,
            { color: isDisabled ? Colors.textTertiary : Colors.primary, textAlign: "center" },
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  const gradientColors =
    variant === "secondary"
      ? [Colors.secondaryContainer, "#E88A10"]
      : isDisabled
      ? [Colors.surfaceContainerHigh, Colors.surfaceContainerHigh]
      : [Colors.primaryContainer, Colors.primary];

  const textColor =
    variant === "secondary" ? Colors.onSecondaryContainer : Colors.onPrimary;

  const shadow = isDisabled ? Shadow.none : Shadow.primaryGlow;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, shadow, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        activeOpacity={0.9}
        style={{ borderRadius: Radius.full, overflow: "hidden" }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.buttonInner}
        >
          {loading ? (
            <ActivityIndicator color={textColor} size="small" />
          ) : (
            <>
              <Text style={[Typo.titleMd, { color: textColor }]}>{title}</Text>
              {icon && (
                <Ionicons
                  name={icon}
                  size={20}
                  color={textColor}
                  style={{ marginLeft: Space.sm }}
                />
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};


/* ══════════════════════════════════════════════════════════════
   MDivider — "OU CONTINUER AVEC" style
   ══════════════════════════════════════════════════════════════ */

export const MDivider = ({ text }) => (
  <View style={styles.dividerRow}>
    <View style={styles.dividerLine} />
    <Text style={[Typo.labelSm, { marginHorizontal: Space.lg, color: Colors.textTertiary }]}>
      {text}
    </Text>
    <View style={styles.dividerLine} />
  </View>
);


/* ══════════════════════════════════════════════════════════════
   MSocialButton — Google / Apple / Facebook
   ══════════════════════════════════════════════════════════════ */

export const MSocialButton = ({ provider, onPress, disabled = false }) => {
  const config = {
    google: {
      label: "Google",
      icon: "logo-google",
      bg: Colors.surfaceContainerLowest,
    },
    apple: {
      label: "Apple",
      icon: "logo-apple",
      bg: Colors.surfaceContainerLowest,
    },
    facebook: {
      label: "Facebook",
      icon: "logo-facebook",
      bg: Colors.surfaceContainerLowest,
    },
  };

  const c = config[provider] || config.google;

  return (
    <TouchableOpacity
      onPress={() => {
        try { Haptics.selectionAsync(); } catch {}
        onPress?.();
      }}
      disabled={disabled}
      activeOpacity={0.7}
      style={[styles.socialBtn, { backgroundColor: c.bg }, Shadow.sm]}
    >
      <Ionicons name={c.icon} size={20} color={Colors.onSurface} />
      <Text style={[Typo.titleSm, { marginLeft: Space.sm, color: Colors.onSurface }]}>
        {c.label}
      </Text>
    </TouchableOpacity>
  );
};


/* ══════════════════════════════════════════════════════════════
   MCulturalCard — "Le saviez-vous ?" card with asymmetric radius
   ══════════════════════════════════════════════════════════════ */

export const MCulturalCard = ({ title, body }) => (
  <View style={[styles.culturalCard, Shadow.sm]}>
    <Text style={[Typo.labelSm, { color: Colors.secondary, marginBottom: Space.sm }]}>
      {title || "LE SAVIEZ-VOUS ?"}
    </Text>
    <Text style={[Typo.bodyMd, { color: Colors.onSurface }]}>{body}</Text>
    {/* Orange decorative blob */}
    <View style={styles.culturalBlob} />
  </View>
);


/* ══════════════════════════════════════════════════════════════
   MChip — Language chip / tag
   ══════════════════════════════════════════════════════════════ */

export const MChip = ({ label, active = false, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.chip,
      active && { backgroundColor: Colors.primary + "15" },
    ]}
  >
    <Text
      style={[
        Typo.bodySm,
        { color: active ? Colors.primary : Colors.textSecondary },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);


/* ══════════════════════════════════════════════════════════════
   MLinkText — "Pas encore de compte ? S'inscrire"
   ══════════════════════════════════════════════════════════════ */

export const MLinkText = ({ text, linkText, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={{ paddingVertical: Space.lg }}>
    <Text style={[Typo.bodyMd, { textAlign: "center", color: Colors.textSecondary }]}>
      {text}{" "}
      <Text style={{ color: Colors.primary, fontWeight: "700" }}>{linkText}</Text>
    </Text>
  </TouchableOpacity>
);


/* ══════════════════════════════════════════════════════════════
   MFooter — © 2024 MULEMA LEARNING ARCHITECTURE
   ══════════════════════════════════════════════════════════════ */

export const MFooter = ({ year = "2026" }) => (
  <Text style={[Typo.labelSm, { textAlign: "center", color: Colors.textTertiary, marginTop: Space["2xl"] }]}>
    © {year} MULEMA LEARNING ARCHITECTURE
  </Text>
);


/* ──────────────────────────────────────────────────────────────
   Internal styles
   ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  // Input
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingVertical: Platform.OS === "ios" ? 16 : 14,
  },
  inputText: {
    flex: 1,
    ...Typo.bodyLg,
    color: Colors.onSurface,
  },

  // Button
  buttonInner: {
    paddingVertical: 16,
    borderRadius: Radius.full,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Space["2xl"],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceVariant,
  },

  // Social
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: Space["2xl"],
    borderRadius: Radius.full,
    flex: 1,
  },

  // Cultural card
  culturalCard: {
    backgroundColor: Colors.secondaryFixed,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius["2xl"],
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.md,
    padding: Space["2xl"],
    overflow: "hidden",
    position: "relative",
  },
  culturalBlob: {
    position: "absolute",
    right: -20,
    bottom: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondaryContainer + "60",
  },

  // Chip
  chip: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
  },
});