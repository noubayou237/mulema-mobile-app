# Mulema Mobile App - Summary Report

## Overview

This report summarizes the key updates and implementations made to the Mulema Mobile App across four main areas: Global Language Change System, Profile Management, App Flow Navigation, and Recent Feature Enhancements.

---

## 1. Global Language Change System

### 1.1 Dual Language Architecture

The app implements a **two-tier language system** that distinguishes between:

- **UI Language (App Interface)**: English (en) or French (fr)
  - Controls all app text, buttons, labels, and interface elements
  - Managed via `LanguageContext.jsx` and persisted in AsyncStorage with key: `app_language`

- **Learning Language (Patrimonial Languages)**: Duala, Bassa, or Ghomala
  - The language the user wants to learn
  - Managed via `selectedLanguage` key in AsyncStorage

### 1.2 Implementation Components

#### LanguageContext (`frontend/src/context/LanguageContext.jsx`)

- Provides React Context for UI language management
- Handles language persistence using AsyncStorage
- Defaults to French if no language is selected
- Exports `LanguageProvider` wrapper component and `useLanguage()` hook

#### i18n Setup (`frontend/src/i18n/`)

- Uses react-i18next for internationalization
- Two locale files implemented:
  - `locales/en.json` - English translations
  - `locales/fr.json` - French translations
- Translation keys organized by feature:
  - `common` - Shared UI elements (save, cancel, confirm, etc.)
  - `auth` - Authentication screens (sign in, sign up, verify email)
  - `profile` - Profile management
  - `settings` - App settings
  - `home`, `lessons`, `exercises` - Main app sections
  - `stats` - Statistics and progress tracking
  - `community` - Community features
  - `errors` - Error messages
  - `messages` - Success messages

#### Language Selection Flow

1. **ChoiceLanguage.jsx** - Initial language selection screen
   - Displays three learning options: Bassa, Duala, Ghomala
   - Uses modal picker for language selection
   - Saves selection to AsyncStorage and navigates to video page

2. **PageVideo.jsx** - Intro video page
   - Accepts language parameter via URL
   - Falls back to stored language from AsyncStorage
   - Shows intro video based on selected learning language
   - Video URLs mapped by language code (placeholder URLs currently)

### 1.3 Language Change from Profile

Users can change the UI language from the Profile screen:

- Access Settings → Language in profile
- Options: English (🇺🇸) or French (🇫🇷)
- Change persists to AsyncStorage and i18n
- Optional backend sync when user is logged in

---

## 2. Profile Management

### 2.1 Profile Features Implemented

#### Profile Screen (`frontend/app/standalone/profile.jsx`)

- **Display Elements**:
  - Profile picture with camera overlay button
  - Username and email display
  - Statistics: Points, Completed lessons, Rank

- **Menu Options**:
  - Edit Profile - Update name and email
  - Language - Change UI language
  - Notifications - Placeholder for future implementation
  - Settings - Placeholder for future implementation
  - Help & Support - Placeholder for future implementation
  - Logout - Sign out and clear session

#### Profile Picture Management

- **Image Picker Integration**:
  - Camera capture option (launchCamera)
  - Gallery selection option (launchImageLibrary)
  - Square aspect ratio (1:1) for profile picture
  - Image quality: 80%

- **Upload Flow**:
  - Preview before upload
  - FormData preparation for API upload
  - PUT request to `/user/profile-picture`
  - Handles R2 Cloudflare storage URLs
  - Image proxy endpoint: `http://192.168.43.125:5001/image/avatars/`

#### Profile Edit Functionality

- Modal form for editing:
  - Name field
  - Email field with validation
- PUT request to `/user/profile`
- Refreshes user context after save
- Success/error alerts

### 2.2 User Context (`frontend/src/context/UserContext.jsx`)

- Manages authentication state
- Provides:
  - `user` - Current user object
  - `isLoading` - Auth loading state
  - `login()` - Authenticate user
  - `logout()` - Sign out and clear session
  - `refreshUser()` - Fetch latest user data
  - `setLanguage()` - Change UI language
- Session stored in AsyncStorage as JSON with:
  - `accessToken`
  - `refreshToken`
- Automatic token validation on app start
- Handles 401 responses by clearing session

### 2.3 Backend Integration

- **Profile Endpoints**:
  - `GET /user/profile` - Fetch profile data
  - `PUT /user/profile` - Update profile
  - `PUT /user/profile-picture` - Upload avatar
  - `PUT /user/language` - Save language preference

---

## 3. App Flow Navigation

### 3.1 Navigation Structure

```
Splash Screen
    ↓
(If no session) → Sign In / Sign Up (Auth)
    ↓
(If session, no language) → ChoiceLanguage
    ↓
(If session, has language) → PageVideo (Intro)
    ↓
(After video) → Tab Navigation (Main App)
    ├── Home (Language-specific: Douala/Bassa/Ghomala)
    ├── Lessons
    ├── Exercises
    └── Community
    ↓
Profile (Standalone - accessible from header)
Stats (Standalone - accessible from community)
```

### 3.2 Navigation Components

#### Splash Screen (`frontend/app/splash.jsx`)

- Animated logo with SVG paths
- 2-second display duration
- Checks for existing session and language
- Routes:
  - No session → `/sign-in`
  - Session, no language → `/ChoiceLanguage`
  - Session + language → `/(tabs)/home`

#### Auth Layout (`frontend/app/(auth)/_layout.jsx`)

- Stack navigator for auth screens
- Auto-redirects logged-in users to home
- Screens: Sign In, Sign Up, Verify Email, Reset Password

#### Tabs Layout (`frontend/app/(tabs)/_layout.jsx`)

- Custom bottom navigation (replaces native tab bar)
- Auth protection - redirects to sign-in if no session
- Shared header with logout button
- Four main tabs: Home, Lessons, Exercises, Community

#### Bottom Navigation (`frontend/app/components/bottom.jsx`)

- Custom tab bar with:
  - Home (house icon)
  - Lessons (book icon)
  - Exercises (medal/trophy icon)
  - Community (group icon)
- Active indicator (red line) for current tab
- Translated labels using i18n

### 3.3 Language-Specific Home Screens

The app routes to different home screens based on the selected learning language:

#### HomeDouala (`frontend/app/homedouala.jsx`)

- Theme: River/Island navigation
- Visual: Blue river path with islands
- Assets: boat.png, island.png, lock.png
- Audio Integration: Added haptic feedback on level start

#### HomeBassa (`frontend/app/homebassa.jsx`)

- Theme: Desert/Pyramids
- Visual: Sandy path with pyramids
- Assets: pyramid-small.png, pyramid-large.png, sphinx.png, camel.png
- Audio Integration: Added haptic feedback on level start

#### HomeGhomala (`frontend/app/homeghomala.jsx`)

- Theme: Mountains/Forest
- Visual: Green mountain path
- Assets: mountain-large.png, mountain-small.png
- Audio Integration: Added haptic feedback on level start

Each home screen:

- Displays 4 levels (Level I - IV)
- Level I is unlocked by default
- Levels II-IV locked until previous completed
- Touchable cards for each level
- Visual indicators for locked/unlocked states

### 3.4 Exercise Flow

#### Exercises Screen (`frontend/app/(tabs)/exercises.jsx`)

- Category cards with i18n translations:
  - Social Life & Family (Vie sociale & Famille)
  - Cooking (Cuisine)
  - Clothing (Vêtements)
  - Fauna & Flora (Faune & Flore)
- Only "Family" category unlocked initially
- Others locked with lock icon
- Animated header on scroll

#### Exercise Screens (`frontend/app/exercices/famille/`)

- `exos1.jsx` - Exercise 1 (Matching exercise)
- `exos2.jsx` - Exercise 2 (Audio dictation)
- `exos3.jsx` - Exercise 3 (Multiple choice)
- `endexos.jsx` - Completion screen

#### Time Tracking (NEW - Implemented)

- Real-time timer using `useState` and `useEffect` with `setInterval`
- Timer displays in MM:SS format during exercises
- Cumulative time tracked across all exercises in a theme
- Time data passed between exercises via navigation params

#### Audio in Exercises (Already Implemented)

- Audio playback for words
- Audio initialization with error handling
- Haptic feedback for correct/incorrect answers

---

## 4. Recent Feature Enhancements

### 4.1 Home Page Audio Integration

**Files Modified:** `homedouala.jsx`, `homebassa.jsx`, `homeghomala.jsx`

- Added audio initialization with `expo-av`
- Added haptic feedback when starting levels
- Audio setup with proper mode configuration:
  - `playsInSilentModeIOS: true`
  - `shouldDuckAndroid: true`
- Cleanup of audio resources on component unmount

### 4.2 Exercise Time Tracking

**Files Modified:** `exos1.jsx`, `exos2.jsx`, `exos3.jsx`

- Implemented real-time timer using `useState` and `useEffect` with `setInterval`
- Timer displays in MM:SS format during exercises
- Time tracked cumulatively across all exercises
- Time data passed between exercises via navigation params
- Each exercise screen shows:
  - Current exercise time
  - Progress percentage

### 4.3 End-of-Exercise Data Display

**File Modified:** `endexos.jsx`

- Added reception of exercise data via `useLocalSearchParams`
- Displays comprehensive results including:
  - **Total time taken** (formatted as MM:SS)
  - **Number of errors** made during exercises
  - **Score** calculated from remaining lives (lives × 20)
  - **Number of completed exercises**
  - **Progress percentage**

### 4.4 Profile Page (Already Complete)

**File:** `profile.jsx`

The profile page was already fully implemented with:

- ✅ Edit personal information (name, email)
- ✅ Add photo from phone gallery (using `launchImageLibrary`)
- ✅ Camera capture (using `launchCamera`)
- ✅ Upload to backend via FormData
- ✅ Language change

---

## 5. Technical Implementation Details

### 5.1 State Management

- **React Context**: LanguageContext, UserContext
- **AsyncStorage**: Persistent storage for:
  - User session (accessToken, refreshToken)
  - Selected learning language
  - UI language preference
  - Intro video seen flag

### 5.2 API Integration

- Base API URL: `http://192.168.43.125:5001` (configurable)
- Axios-based API service
- JWT authentication
- Token refresh handling
- R2 Cloudflare storage for images

### 5.3 UI/UX Features

- SafeAreaView for notch handling
- Custom bottom navigation
- Animated transitions
- Modal pickers
- Image cropping (square aspect)
- Loading states and activity indicators

---

## 6. Summary of Updates Made

| Feature                   | Status      | Files Modified                                 |
| ------------------------- | ----------- | ---------------------------------------------- |
| Global Language (i18n)    | ✅ Complete | LanguageContext.jsx, en.json, fr.json          |
| Language Selection Flow   | ✅ Complete | ChoiceLanguage.jsx, PageVideo.jsx              |
| Profile Management        | ✅ Complete | profile.jsx, UserContext.jsx                   |
| Profile Picture Upload    | ✅ Complete | profile.jsx (ImagePicker integration)          |
| Profile - Gallery Photo   | ✅ Complete | Already implemented in profile.jsx             |
| Auth Navigation           | ✅ Complete | (auth)/\_layout.jsx, sign-in.jsx               |
| Tab Navigation            | ✅ Complete | (tabs)/\_layout.jsx, bottom.jsx                |
| Language-Specific Homes   | ✅ Complete | homedouala.jsx, homebassa.jsx, homeghomala.jsx |
| Home Audio Integration    | ✅ Complete | homedouala.jsx, homebassa.jsx, homeghomala.jsx |
| Home Router               | ✅ Complete | (tabs)/home.jsx                                |
| Exercise Flow             | ✅ Complete | exercices.jsx, exercices/famille/\*            |
| Exercise Time Tracking    | ✅ Complete | exos1.jsx, exos2.jsx, exos3.jsx                |
| End Exercise Data Display | ✅ Complete | endexos.jsx                                    |
| Statistics                | ✅ Complete | stats.jsx                                      |
| Community                 | ✅ Complete | community.jsx                                  |

---

## 7. Next Steps / Pending Items

1. **Backend Video URLs** - Replace placeholder video URLs in PageVideo.jsx
2. **Notifications Screen** - Implement notification settings
3. **Settings Screen** - Complete settings page
4. **Help & Support** - Implement help section
5. **Exercise Completion** - Backend integration for tracking progress
6. **Level Unlocking** - Backend logic for unlocking levels
7. **Real Statistics** - Connect stats.jsx to backend API
8. **Community Features** - Expand community functionality
9. **Welcome Audio** - Add actual audio files for home page welcome messages

---

_Report generated for team review_
_Project: Mulema Mobile App (Patrimonial Languages Learning Platform)_
