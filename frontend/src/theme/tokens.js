/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Design Tokens                                      ║
 * ║  Import this file in every screen/component.                  ║
 * ║  Nothing visual is hard-coded anywhere else.                  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  Usage:
 *    import { Colors, Typo, Space, Radius, Shadow } from "@/theme/tokens";
 */

import { Platform } from "react-native";

/* ──────────────────────────────────────────────────────────────
   1. COLORS
   ────────────────────────────────────────────────────────────── */

export const Colors = {
  // ── Primary (Action / Energy) ──
  primary:           "#B71C1C",
  primaryContainer:  "#E53935",
  onPrimary:         "#FFFFFF",
  onPrimaryContainer:"#410002",

  // ── Secondary (Reward / Energy) ──
  secondary:            "#895100",
  secondaryContainer:   "#FD9D1A",
  onSecondaryContainer: "#2C1700",
  secondaryFixed:       "#FFDCBC",   // Cultural micro-card bg

  // ── Neutrals ──
  onSurface:            "#131B2E",   // Main text (navy-black)
  onSurfaceVariant:     "#44474E",   // Secondary text
  surface:              "#FAF8FF",   // Base app background
  surfaceContainerLowest:"#FFFFFF",  // Card "pop" layer
  surfaceContainerLow:  "#F4F1F8",  // Input backgrounds / subtle nesting
  surfaceContainerHigh: "#EAE7EF",  // Hover / pressed states
  surfaceContainerHighest:"#DAE2FD",// Inner nested items
  surfaceVariant:       "#E2E1EC",  // Progress bar bg, dividers

  // ── Outline ──
  outline:         "#757780",
  outlineVariant:  "#BBCABE",        // Ghost borders (use at 15% opacity)

  // ── Semantic ──
  error:           "#BA1A1A",
  errorContainer:  "#FFDAD6",
  onError:         "#FFFFFF",
  success:         "#2E7D32",
  successContainer:"#A5D6A7",
  onSuccess:       "#FFFFFF",

  // ── Helpers ──
  textPrimary:     "#131B2E",
  textSecondary:   "#6B7280",
  textTertiary:    "#9CA3AF",
  textLink:        "#B71C1C",
  transparent:     "transparent",
  white:           "#FFFFFF",
  black:           "#0F172A",        // Never pure #000
};


/* ──────────────────────────────────────────────────────────────
   2. TYPOGRAPHY
   Font: the app's existing font is kept (nunito on iOS, default on Android).
   These objects are spread directly into <Text style={...}>.
   ────────────────────────────────────────────────────────────── */

// Police fantaisiste pour titres/headings (Fredoka — arrondie et chaleureuse)
const fontTitle = "Fredoka_700Bold";
const fontTitleMd = "Fredoka_600SemiBold";
const fontTitleSm = "Fredoka_500Medium";

// Police corps de texte (Nunito — lisible et douce)
const fontBody = "Nunito-Regular";
const fontBodyMedium = "Nunito-Medium";
const fontBodySemiBold = "Nunito-SemiBold";
const fontBodyBold = "Nunito-Bold";

export const Typo = {
  displayLg: {
    fontFamily: fontTitle,
    fontSize: 40,
    lineHeight: 48,
    color: Colors.onSurface,
  },
  displayMd: {
    fontFamily: fontTitle,
    fontSize: 32,
    lineHeight: 40,
    color: Colors.onSurface,
  },
  headlineLg: {
    fontFamily: fontTitle,
    fontSize: 28,
    lineHeight: 36,
    color: Colors.onSurface,
  },
  headlineMd: {
    fontFamily: fontTitle,
    fontSize: 24,
    lineHeight: 32,
    color: Colors.onSurface,
  },
  titleLg: {
    fontFamily: fontTitleMd,
    fontSize: 20,
    lineHeight: 28,
    color: Colors.onSurface,
  },
  titleMd: {
    fontFamily: fontTitleMd,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.onSurface,
  },
  titleSm: {
    fontFamily: fontTitleSm,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.onSurface,
  },
  bodyLg: {
    fontFamily: fontBody,
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
  },
  bodyMd: {
    fontFamily: fontBody,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 21,
    color: Colors.onSurfaceVariant,
  },
  bodySm: {
    fontFamily: fontBody,
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  labelLg: {
    fontFamily: fontBodySemiBold,
    fontSize: 14,
    letterSpacing: 0.4,
    lineHeight: 20,
    color: Colors.onSurface,
  },
  labelMd: {
    fontFamily: fontBodySemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  labelSm: {
    fontFamily: fontBodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    lineHeight: 16,
    color: Colors.textTertiary,
  },
};

// Export des familles de polices pour usage direct
export const Fonts = {
  title:      fontTitle,
  titleMd:    fontTitleMd,
  titleSm:    fontTitleSm,
  body:       fontBody,
  bodyMedium: fontBodyMedium,
  bodySemiBold: fontBodySemiBold,
  bodyBold:   fontBodyBold,
};


/* ──────────────────────────────────────────────────────────────
   3. SPACING  (8-point grid)
   ────────────────────────────────────────────────────────────── */

export const Space = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
};


/* ──────────────────────────────────────────────────────────────
   4. BORDER RADIUS
   ────────────────────────────────────────────────────────────── */

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,       // cards, inputs
  xl:   24,       // large cards, modals
  "2xl": 32,      // hero containers
  full: 9999,     // pills, avatars, buttons
};


/* ──────────────────────────────────────────────────────────────
   5. SHADOWS  (ambient, tinted — never pure black)
   ────────────────────────────────────────────────────────────── */

export const Shadow = {
  none: {
    shadowColor: Colors.transparent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },
  // Colored glow for primary buttons
  primaryGlow: {
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
};


/* ──────────────────────────────────────────────────────────────
   6. EXPORT SHORTCUT
   ────────────────────────────────────────────────────────────── */

const tokens = { Colors, Typo, Space, Radius, Shadow };
export default tokens;