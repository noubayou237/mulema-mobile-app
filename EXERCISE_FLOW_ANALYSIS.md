# Mulema App - Exercise Flow Analysis

## Overview

This document describes the complete flow of the exercise system, from the exercises menu to completion, including the pedagogical improvements made.

---

## Current Exercise Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXERCISES MENU                                  │
│                    (frontend/app/(tabs)/exercices.jsx)                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │  Theme Cards (locked/unlocked) │
                    │  - Vie sociale & famille     │
                    │  - Cooking (locked)           │
                    │  - Clothing (locked)          │
                    │  - Fauna & Flora (locked)    │
                    └─────────────────────────────┘
                                    │
                    (User taps "Vie sociale & famille")
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXERCISE 1: MATCHING                             │
│                   (frontend/app/exercices/famille/exos1.jsx)           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Instruction: "Associe chaque mot avec sa bonne traduction !"   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────┐       ┌──────────────┐                              │
│  │ FRENCH       │       │ DUALA        │                              │
│  ├──────────────┤       ├──────────────┤                              │
│  │ Le papa      │       │ Papá         │                              │
│  │ La maman     │       │ Mamá         │                              │
│  │ Le frère     │       │ Muna         │                              │
│  │ La sœur     │       │ Sango        │                              │
│  │ ...          │       │ ...          │                              │
│  └──────────────┘       └──────────────┘                              │
│                                                                         │
│  ✅ Uses SAME 6 words from themeData.js                                │
│  ✅ Audio available for each word                                       │
│  ✅ Tracks time and errors                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    (Complete matching)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXERCISE 2: LISTEN & WRITE                     │
│                   (frontend/app/exercices/famille/exos2.jsx)           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔊 Audio Button (plays word audio)                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  [ Input Field: "Écrivez votre réponse ici..." ]              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ✅ Uses WORDS FROM SAME POOL (random selection)                       │
│  ✅ Shows correct answer on error                                      │
│  ✅ Tracks time and lives                                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    (Complete writing)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXERCISE 3: SELECT IMAGE                          │
│                   (frontend/app/exercices/famille/exos3.jsx)           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Question: "Quel est le mot local pour dire 'Le frère' ?"      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐                                   │
│  │   Papá      │  │   Muna ⭐    │ ← CORRECT                        │
│  └──────────────┘  └──────────────┘                                   │
│  ┌──────────────┐  ┌──────────────┐                                   │
│  │   Sango      │  │   Ndómɛ      │                                   │
│  └──────────────┘  └──────────────┘                                   │
│                                                                         │
│  ✅ Uses WORDS FROM SAME POOL                                           │
│  ✅ 4 options including correct answer                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    (Complete selection)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         END SCREEN                                      │
│                   (frontend/app/exercices/famille/endexos.jsx)         │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🎉 Congratulations!                                              │   │
│  │  ⏱️ Time: 2:35                                                 │   │
│  │  🎯 Accuracy: 90%                                              │   │
│  │  ⭐ Points: 570                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  🔄 Smart Repetition Button                                     │   │
│  │     → Shows all 6 words with animations                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  📝 Retry Failed Exercises (if any)                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Improvements Made

### 1. Word Pool Consistency (Phase 1)

**Before:** Each exercise used different/different words

- exos1: 6 different pairs
- exos2: 1 word
- exos3: 1 different word

**After:** All exercises use the SAME 6-word pool

- [`frontend/app/data/themeData.js`](frontend/app/data/themeData.js) - Centralized word pool

```javascript
export const THEME_FAMILLE_WORDS = [
  { id: "p1", fr: "Le papa", local: "Papá", ... },
  { id: "p2", fr: "La tante paternelle", local: "Ndómɛ á tetɛ́", ... },
  { id: "p3", fr: "La maman", local: "Mamá", ... },
  { id: "p4", fr: "L'oncle paternel", local: "Árí á tetɛ́", ... },
  { id: "p5", fr: "Le frère", local: "Muna", ... },
  { id: "p6", fr: "La sœur", local: "Sango", ... },
];
```

### 2. Database Schema (Phase 1)

**Added to** [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma):

- **Theme** - Groups vocabulary by theme
- **Word** - Individual vocabulary items
- **LearningBlock** - Groups of 6 words
- **WordProgress** - Tracks user learning with spaced repetition

### 3. Backend Exercise Engine (Phase 2)

**Service:** [`backend/src/learning/exercise/exercise-engine.service.ts`](backend/src/learning/exercise/exercise-engine.service.ts)

Generates exercises dynamically:

- `generateBlockExercises(blockId)` - Creates matching, write, select exercises
- `generateThemeExercises(themeId)` - Creates all theme exercises
- `getWordsForReview(userId)` - Returns words due for review
- `updateWordProgress()` - SM-2 algorithm implementation

### 4. Spaced Repetition (Phase 3)

**Hook:** [`frontend/app/hooks/useSpacedRepetition.js`](frontend/app/hooks/useSpacedRepetition.js)

Implements SM-2 algorithm:

- **Ease Factor**: 2.5 (decreases on failure, min 1.3)
- **Intervals**: [1, 3, 7, 14, 30, 60] days
- Progress tracked per user per word

---

## Gamification Features

### Hearts/Cowries System

- [`frontend/app/hooks/useCowrie.jsx`](frontend/app/hooks/useCowrie.jsx)
- 5 hearts per session
- 9-minute recharge time
- Game over at 0 hearts

### Scoring System

- [`frontend/app/utils/scoring.jsx`](frontend/app/utils/scoring.jsx)
- Based on accuracy + time
- Up to 700 XP for perfect score under 2 minutes

### Failed Exercises Tracking

- [`frontend/app/hooks/useFailedExercises.jsx`](frontend/app/hooks/useFailedExercises.jsx)
- Failed questions queued for retry

---

## API Endpoints

| Endpoint                             | Method | Description                     |
| ------------------------------------ | ------ | ------------------------------- |
| `/exercises/block/:blockId/generate` | GET    | Generate exercises for block    |
| `/exercises/theme/:themeId/generate` | GET    | Generate exercises for theme    |
| `/exercises/review/:userId`          | GET    | Get words for spaced repetition |
| `/exercises/word-progress`           | POST   | Update word progress            |

---

## Test Coverage

### Backend Tests

- [`backend/test/exercise-engine.test.ts`](backend/test/exercise-engine.test.ts)
- 6 tests: Matching, Write, Select, SM-2 intervals, Shuffling, Difficulty

### Frontend Tests

- [`frontend/app/__tests__/themeData.test.js`](frontend/app/__tests__/themeData.test.js)
- [`frontend/app/__tests__/spacedRepetition.test.js`](frontend/app/__tests__/spacedRepetition.test.js)
- 16 tests total covering all algorithms

---

## Pedagogical Flow Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNING OBJECTIVE                                │
│         Learner should know 6 words after completing                 │
│                  all 3 exercises                                      │
└─────────────────────────────────────────────────────────────────────┘

   Page 1: DISCOVERY & RECOGNITION
   ┌─────────────────────────────────────────────────────────────┐
   │  Matching Exercise                                          │
   │  - See French ↔ Local pairs                                │
   │  - Audio pronunciation available                            │
   │  - Match all 6 words                                       │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   Page 2: GUIDED PRODUCTION
   ┌─────────────────────────────────────────────────────────────┐
   │  Listen & Write Exercise                                   │
   │  - Hear word in target language                            │
   │  - Type the translation                                    │
   │  - Get immediate feedback                                  │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   Page 3: ACTIVE CONSOLIDATION
   ┌─────────────────────────────────────────────────────────────┐
   │  Multiple Choice Exercise                                   │
   │  - Read question in French                                 │
   │  - Select correct local word                               │
   │  - Solidify memorization                                  │
   └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
   END: SMART REPETITION
   ┌─────────────────────────────────────────────────────────────┐
   │  - Review all 6 words with animations                     │
   │  - Visual repetition for memorization                      │
   │  - Spaced repetition scheduled for future                  │
   └─────────────────────────────────────────────────────────────┘
```

---

## File Structure Summary

```
backend/
├── prisma/
│   └── schema.prisma              ← Word, Theme, Block, WordProgress models
└── src/learning/exercise/
    ├── exercise-engine.service.ts ← Exercise generation + SM-2
    ├── exercise.controller.ts     ← API endpoints
    └── dto/exercise-engine.dto.ts ← DTOs

frontend/
├── app/
│   ├── data/
│   │   └── themeData.js           ← Shared 6-word pool
│   ├── hooks/
│   │   ├── useCowrie.jsx          ← Hearts system
│   │   ├── useSpacedRepetition.js ← SM-2 algorithm
│   │   └── useFailedExercises.jsx ← Failed question tracking
│   ├── composants/
│   │   └── SmartRepetition.jsx   ← Visual flashcard review
│   └── exercices/famille/
│       ├── exos1.jsx              ← Matching (updated)
│       ├── exos2.jsx              ← Write (updated)
│       ├── exos3.jsx              ← Select (updated)
│       └── endexos.jsx            ← Results + review
└── __tests__/
    ├── themeData.test.js          ← Word pool tests
    └── spacedRepetition.test.js   ← SM-2 tests
```

---

Mulema Mobile App exercise flow analysis
