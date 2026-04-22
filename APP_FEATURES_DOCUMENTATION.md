# Mulema Mobile App - Feature & System Documentation

This document provides a critical review and technical overview of the Mulema Mobile App features as of April 2026. It is designed to assist developers in understanding the system architecture, active logic, and areas requiring attention.

---

## 1. System Architecture Overview

### 1.1 Tech Stack
- **Frontend**: React Native with Expo (Router), Zustand for state management, Axios for API calls.
- **Backend**: NestJS (Node.js) with Prisma ORM and PostgreSQL.
- **Storage**: Cloudflare R2 (S3-compatible) for user avatars and media.

### 1.2 Authentication & Session Management
- **Flow**: JWT-based authentication with `accessToken` and `refreshToken`.
- **Persistence**: Session tokens are stored in `AsyncStorage` under the key `userSession`.
- **Security**: 
    - The **C-02 Vulnerability** has been addressed: User IDs are no longer trusted from request bodies. Instead, they are extracted from the JWT context using the `@CurrentUser()` decorator and `JwtAuthGuard` in NestJS.
    - Input blocking is implemented on all auth forms during API calls to prevent race conditions.

---

## 2. Core Feature Flows

### 2.1 Onboarding & Language Selection
1.  **Splash Screen**: Checks for an active session and whether the intro video has been seen.
2.  **ChoiceLanguage**: User selects a learning language (Duala, Bassa, Ghomala).
3.  **Introduction Video**: Language-specific intro video (`PageVideo.jsx`).
    - *Status*: Functional using local mp4 assets.
    - *Logic*: Once the video finishes (or is skipped), the `hasSeenIntro` flag is set in the `LanguageStore` and persisted.

### 2.2 Dashboard & Learning Path
- **Dashboard**: Displays live statistics (XP, Hearts, Streak) from the `/user/dashboard` endpoint.
- **Continue Journey**: A dynamic button that identifies the next incomplete theme/lesson for the active language.
- **Theme Progression**: 
    - Themes are unlocked sequentially.
    - **Initial State**: First 2 lessons of a theme are unlocked by default.
    - **Unlocking**: Subsequent lessons are unlocked only after passing the theme's block exercises with at least **60% precision**.

### 2.3 Unified Exercise System
The app has transitioned from standalone exercise screens to a **Unified Exercise Session** integrated into the lesson flow.
- **Location**: `frontend/app/(tabs)/lessons/[themeId]/exercise/`
- **Backend Logic**: `ExerciseEngineService` dynamically generates three types of questions from the theme's word pool:
    1.  **MATCHING**: Word-to-translation matching.
    2.  **LISTEN_WRITE**: Audio dictation with text input.
    3.  **LISTEN_SELECT_IMAGE**: Audio prompt with image/text multiple choice.
- **Spaced Repetition**: Uses the **SM-2 algorithm** to schedule review sessions based on correctness and frequency.

---

## 3. Gamification (The "Roots" System)

| Asset | Internal Name | Description |
| :--- | :--- | :--- |
| **Prawns** | `totalPrawns` | Experience points (XP) earned by completing lessons and exercises. |
| **Roots** | `daysConnected` | Daily login streak. Resets if a day is skipped. Managed by `UserService.updateStreak`. |
| **Cowries** | `currentCowries` | Hearts/Lives. Users lose 1 cowry per failed exercise. Recharges over time (or via shop - placeholder). |

---

## 4. Feature Status Registry

### ✅ Fully Functional
- **Authentication**: Login, Signup, OTP Verification (iOS fix included), Password Reset.
- **Onboarding**: Full flow with video and language persistence.
- **Dashboard**: Live stats sync, theme discovery.
- **Unified Exercises**: Dynamic question generation from DB word pools.
- **Leaderboard**: Real-time ranking of top 20 users with podium.
- **Profile**: Avatar upload, name/email editing, UI language toggle.

### ⚠️ Partially Functional / Needs Review
- **Legacy Exercises**: Files in `frontend/app/exercices/famille/` are redundant and should be phased out in favor of the unified `(tabs)/lessons/` path.
- **Statistics**: `standalone/stats.jsx` shows high-level stats but lacks the deep "Learning Curve" visuals seen in some design mocks.
- **Offline Mode**: `OfflineBanner` exists but its integration across all screens needs verification.

### ❌ Non-Functional / Placeholders
- **Notifications**: Static screen without backend push integration.
- **Help & Support**: UI exists but actions are not connected.
- **Settings**: Most toggles (Sound, Notifications) are visual only.
- **Community**: Feed features (posts/comments) are missing; only the Leaderboard is functional.

---

## 5. Recent Critical Changes
1.  **OTP iOS Compatibility**: Fixed the digit input issue where iOS devices were not correctly splitting the OTP code across inputs.
2.  **C-02 Security Hardening**: Removed all `userId` fields from request bodies in `ExerciseController` and `ProgressController`. Session context is now strictly server-side.
3.  **Mulema Red Theme**: Standardized all lesson and exercise headers to the primary brand color (#C81E2F).
4.  **Audio Fixes**: Audio pools in matching exercises now use proper cleanup to avoid memory leaks during long sessions.

---

## 6. Known Technical Debt
- **Redundant Routes**: `standalone/profile.jsx` and `app/standalone/profile_page.jsx` both exist. Use the former.
- **Hardcoded Icons**: Some theme icons are still mapped in the frontend `ICONS` constant rather than being served by the backend API.
- **Legacy Data**: `frontend/app/data/themeData.js` is still used in some legacy screens, causing duplication with the backend database.

---
*Generated for the Mulema Development Team*
