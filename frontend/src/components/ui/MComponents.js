/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Reusable UI Components                             ║
 * ║  Import any component in any screen.                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage:
 *    import { MInput, MButton, MChip }
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
  ...rest
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
          accessibilityLabel={rest.accessibilityLabel || label || placeholder}
          {...rest}
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
  accessibilityLabel,
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
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
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
        accessibilityLabel={accessibilityLabel || title}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
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
   MChip — Language chip / tag
   ══════════════════════════════════════════════════════════════ */

export const MChip = ({ label, active = false, onPress, accessibilityLabel }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.chip,
      active && { backgroundColor: Colors.primary + "15" },
    ]}
    accessibilityLabel={accessibilityLabel || label}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
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
  <TouchableOpacity 
    onPress={onPress} 
    activeOpacity={0.7} 
    style={{ paddingVertical: Space.lg }}
    accessibilityRole="link"
    accessibilityLabel={`${text} ${linkText}`}
  >
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




  // Chip
  chip: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.full,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
  },
});

/* ══════════════════════════════════════════════════════════════
   MLoader — Premium full-screen loading overlay
   ══════════════════════════════════════════════════════════════ */

export const MLoader = ({ message, fullScreen = true }) => (
  <View 
    style={[
      styles.loaderContainer,
      fullScreen && StyleSheet.absoluteFill,
      fullScreen && { backgroundColor: "rgba(10, 10, 15, 0.85)", zIndex: 9999 }
    ]}
    accessibilityRole="progressbar"
    accessibilityLiveRegion="polite"
  >
    <View style={styles.loaderContent}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message && (
        <Text style={[Typo.bodyMd, { color: Colors.textSecondary, marginTop: Space.lg, textAlign: "center" }]}>
          {message}
        </Text>
      )}
    </View>
  </View>
);

Object.assign(styles, {
  loaderContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loaderContent: {
    padding: Space["2xl"],
    borderRadius: Radius.xl,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    minWidth: 120,
  }
});