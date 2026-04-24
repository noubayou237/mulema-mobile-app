---
name: Mulema App - Project Overview
description: Key facts about the Mulema mobile app architecture, features, and known issues
type: project
---

**App:** Mulema — language learning platform for Cameroonian languages (Duala, Bassa, Ghomala)
**Why:** Cultural preservation through gamified mobile learning app

**Stack:**
- Frontend: React Native / Expo (expo-router), Zustand, NestJS backend, Prisma/PostgreSQL
- Backend: NestJS, Prisma ORM, PostgreSQL, Cloudflare R2 for media
- Auth: JWT + refresh tokens (email/password only; social login removed)

**Features — Functional:**
- Email/password login, registration, OTP email verification, password reset
- Lesson system with 4 themes per language (Family, Animals, Cooking, Clothing)
- Exercise types: text_qcm (multiple choice), match (word pairs), write (dictation), complete
- Gamification: XP (Prawns), Streak (Roots), Hearts (Cowries)
- Profile editing, avatar selection/upload, account deletion
- Leaderboard/community screen
- i18n: French and English UI, 3 learning languages

**Features — Removed:**
- Social login (Google, Facebook, Apple) — backend has no endpoints, files deleted
- Dark/light mode toggle — removed from settings
- Daily reminder toggle — removed from settings

**Features — Implemented but "Coming Soon" UI:**
- Push notifications toggle (shows "coming soon" — correctly disclosed)

**Features — Implemented (fixed in this session):**
- Help & Support → opens mailto:support@mulema.app
- Terms of Service → opens EXPO_PUBLIC_TERMS_URL in WebBrowser

**Image Exercise Status:**
- IMAGES_MAP updated with 26 clean keys (img_family_*, img_animal_*, img_cooking_*, img_clothing_*)
- All 3 seeds updated with image_url assignments — avg 60% of words now have images
- No-image words (e.g. La girafe, Les abeilles, Le sel) gracefully fall back to text_qcm
- Cockroach image correctly mapped to "Le cafard" (cockroach), not to "La sauterelle" (grasshopper)
- Avatar images separated into `Avatar-images -profile-picker/` folder, only used in profile picker
- Duplicate .avif avatar entries removed from IMAGES_MAP (png always wins, avif was dead code)

**Production Config:**
- API: `EXPO_PUBLIC_API_IP` only used in __DEV__; production uses `https://api.mulema.app/api`
- `userInterfaceStyle: "light"` (fixed from "automatic" since dark mode not implemented)
- Bundle ID: `com.mulema.app` (iOS + Android)
- OTA Updates via expo-updates configured

**How to apply:** Inform architecture decisions, avoid re-implementing removed features, reference when triaging bugs.
