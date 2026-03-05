# Mulema Mobile App - Pedagogical & Technical Review

## Executive Summary

This document provides a comprehensive review of the current Mulema language learning app implementation against the pedagogical model and architecture that was designed. The review identifies what's implemented, what's missing, and provides actionable recommendations for improvement.

---

## Part 1: Current Implementation Analysis

### 1.1 What IS Implemented ✅

#### Gamification System

| Feature                | Status      | Implementation                                                                    |
| ---------------------- | ----------- | --------------------------------------------------------------------------------- |
| Cowrie (Hearts) System | ✅ Complete | [`useCowrie.jsx`](frontend/app/hooks/useCowrie.jsx) - 5 hearts, 9-minute recharge |
| XP/Crevettes Scoring   | ✅ Complete | [`scoring.jsx`](frontend/app/utils/scoring.jsx) - Matrix-based scoring            |
| Accuracy Calculation   | ✅ Complete | Based on hearts lost (100%, 90%, 79%, 59%, 45%)                                   |
| Time-based Bonus       | ✅ Complete | Under/Over 2 minutes differentiation                                              |

#### Exercise Structure

| Exercise             | Status      | File                                                    |
| -------------------- | ----------- | ------------------------------------------------------- |
| Matching (Crossword) | ✅ Complete | [`exos1.jsx`](frontend/app/exercices/famille/exos1.jsx) |
| Listen & Write       | ✅ Complete | [`exos2.jsx`](frontend/app/exercices/famille/exos2.jsx) |
| Multiple Choice      | ✅ Complete | [`exos3.jsx`](frontend/app/exercices/famille/exos3.jsx) |

#### Support Features

| Feature                   | Status      | Implementation                                                        |
| ------------------------- | ----------- | --------------------------------------------------------------------- |
| Smart Repetition          | ✅ Complete | [`SmartRepetition.jsx`](frontend/app/components/SmartRepetition.jsx)  |
| Failed Exercises Tracking | ✅ Complete | [`useFailedExercises.jsx`](frontend/app/hooks/useFailedExercises.jsx) |
| End Screen with Stats     | ✅ Complete | [`endexos.jsx`](frontend/app/exercices/famille/endexos.jsx)           |
| Audio Playback            | ✅ Complete | Expo AV with error handling                                           |
| Haptic Feedback           | ✅ Complete | expo-haptics                                                          |

#### Database Schema

| Entity          | Status      | Notes                                       |
| --------------- | ----------- | ------------------------------------------- |
| User            | ✅ Complete | Basic user model                            |
| Word/Vocabulary | ❌ Missing  | **No dedicated word table**                 |
| Theme/Lesson    | ⚠️ Partial  | Lesson model exists but not linked to words |
| Exercise        | ⚠️ Partial  | Exercise model exists but manual            |
| Question        | ⚠️ Partial  | Question model exists but manual            |
| UserProgress    | ✅ Complete | Progress tracking                           |
| Cowry           | ✅ Complete | Heart system                                |

---

## Part 2: Critical Gap Analysis

### 2.1 The Core Pedagogical Problem ❌

**Your biggest issue is IMPLEMENTED but NOT working as designed:**

#### Current Data Flow (BROKEN):

```
exos1.jsx          exos2.jsx           exos3.jsx
   │                   │                   │
   ▼                   ▼                   ▼
[Word A, B, C, D]   [Word E, F]         [Word G, H]
   │                   │                   │
   └───────────────────┴───────────────────┘
              DIFFERENT WORDS!
              ❌ NO REPETITION
```

#### What's in Each Exercise:

| Exercise         | Words Used                                        | Source                 |
| ---------------- | ------------------------------------------------- | ---------------------- |
| exos1 (Matching) | Papá, Ndómɛ á tetɛ́, Mamá, Árí á tetɛ́, Muna, Sango | Hardcoded pairs        |
| exos2 (Write)    | Papá                                              | Single hardcoded word  |
| exos3 (Select)   | Muna                                              | Single hardcoded word  |
| endexos          | p1-p6 (6 words)                                   | REPETITION_WORDS array |

#### The Problem:

- **No unified word pool per theme/block**
- **Words don't repeat across exercises**
- **6 words are in REPETITION_WORDS but aren't the same 6 words used in exercises**

---

### 2.2 Missing Components

#### 1. Word Management System ❌

```
What's Needed:
┌─────────────────────────────────────────┐
│            Word Table                   │
├─────────────────────────────────────────┤
│ - id                                     │
│ - themeId                                │
│ - sourceText (French)                   │
│ - targetText (Local/Duala)              │
│ - imageUrl                               │
│ - audioUrl                               │
│ - difficultyLevel                        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│         LearningBlock Table             │
├─────────────────────────────────────────┤
│ - id                                     │
│ - themeId                                │
│ - wordIds[] (6 words per block)         │
└─────────────────────────────────────────┘
```

**Current State:** Words are hardcoded in each exercise file.

#### 2. Exercise Engine ❌

```
What's Needed:
┌─────────────────────────────────────────┐
│       ExerciseEngineService             │
├─────────────────────────────────────────┤
│ generateExercises(words[], type[])     │
│   → returns exercise[]                  │
│                                          │
│ createMatching(words)                   │
│ createFillBlank(words)                  │
│ createListenWrite(words)                │
│ createListenSelectImage(words)          │
└─────────────────────────────────────────┘
```

**Current State:** Each exercise is hardcoded separately.

#### 3. Spaced Repetition System ❌

```
What's Needed:
┌─────────────────────────────────────────┐
│       UserWordProgress Table            │
├─────────────────────────────────────────┤
│ - wordId                                 │
│ - userId                                 │
│ - successCount                          │
│ - failureCount                          │
│ - nextReviewDate                        │
│ - easeFactor                            │
└─────────────────────────────────────────┘
```

**Current State:** Only failed exercises tracked, no spaced repetition.

---

## Part 3: Pedagogical Model Comparison

### 3.1 Your Design (from conversation):

```
Theme: Animals
Block: 6 words

Page 1 (Discovery)     Page 2 (Production)     Page 3 (Consolidation)
├─ Image + Audio      ├─ Word Scramble        ├─ Write without help
├─ Match image↔word  ├─ Crossword            ├─ Select correct image
└─ Choose word        └─ Fill missing        └─ Listen & write

                     REPEAT with SAME 6 WORDS
```

### 3.2 Current Implementation:

```
exos1: Matching (6 pairs = 12 words)
   ├─ Papa ↔ Papá
   ├─ Tante ↔ Ndómɛ á tetɛ́
   └─ ...

exos2: Write (1 word)
   └─ "Papá"

exos3: Select (1 word from 4 options)
   └─ "Muna" from [Papá, Ndómɛ, Muna, Sango]

Result: Different words, NO repetition, NO systematic learning
```

### 3.3 Gap Analysis Summary

| Pedagogical Element                    | Your Design | Current App                    | Status       |
| -------------------------------------- | ----------- | ------------------------------ | ------------ |
| 6-word block                           | ✅          | ❌ (uses 6-12 different words) | **CRITICAL** |
| Same words across exercises            | ✅          | ❌                             | **CRITICAL** |
| Discovery → Production → Consolidation | ✅          | ⚠️ (wrong order)               | Needs Fix    |
| Audio + Image + Text                   | ✅          | ⚠️ (partial)                   | Needs Fix    |
| Spaced Repetition                      | ✅          | ❌                             | **MISSING**  |
| Progressive difficulty                 | ✅          | ❌                             | **MISSING**  |
| Block-based structure                  | ✅          | ❌                             | **MISSING**  |

---

## Part 4: Technical Architecture Review

### 4.1 Backend (NestJS + PostgreSQL)

#### What's Implemented:

- ✅ User authentication (JWT)
- ✅ Basic lesson/exercise structure
- ✅ Cowry model
- ✅ Progress tracking

#### What's Missing:

- ❌ Word/Theme management API
- ❌ Exercise generation engine
- ❌ Spaced repetition algorithm
- ❌ XP calculation service

### 4.2 Frontend (React Native)

#### What's Implemented:

- ✅ 3 exercise screens (matching, write, select)
- ✅ Cowrie hook with auto-recharge
- ✅ Scoring utilities
- ✅ Smart repetition component
- ✅ Failed exercises tracking
- ✅ End screen with stats

#### What's Missing:

- ❌ Dynamic exercise generation from word pool
- ❌ Generic ExerciseRenderer component
- ❌ Real backend integration for exercises
- ❌ Progress persistence to backend

---

## Part 5: Recommended Action Plan

### Phase 1: Fix Core Pedagogical Issues (Week 1-2)

#### 1.1 Create Word Database Schema

```prisma
// Add to schema.prisma
model Word {
  id              String @id @default(uuid())
  themeId         String
  sourceText      String  // French: "Le papa"
  targetText      String  // Duala: "Papá"
  imageUrl        String?
  audioUrl        String?
  difficultyLevel Int     @default(1)

  theme           Theme   @relation(fields: [themeId], references: [id])
  progress        WordProgress[]
}

model Theme {
  id          String @id @default(uuid())
  title       String
  description String?
  order       Int
  languageId  String

  words       Word[]
  blocks      LearningBlock[]
}

model LearningBlock {
  id        String @id @default(uuid())
  themeId   String
  blockOrder Int

  theme     Theme  @relation(fields: [themeId], references: [id])
  words     Word[] // Exactly 6 words per block
}

model WordProgress {
  id            String   @id @default(uuid())
  wordId        String
  userId        String
  successCount  Int      @default(0)
  failureCount  Int      @default(0)
  lastReviewed  DateTime?
  nextReview    DateTime?
  easeFactor    Float    @default(2.5)

  word          Word     @relation(fields: [wordId], references: [id])

  @@unique([userId, wordId])
}
```

#### 1.2 Create Exercise Generation Service

```typescript
// backend/src/learning/exercise/engine.service.ts
@Injectable()
export class ExerciseEngineService {
  generateBlockExercises(blockId: string, userId: string): Exercise[] {
    // 1. Get 6 words from block
    // 2. Generate all 3 exercise types with SAME words
    // 3. Return exercises
  }

  createMatching(words: Word[]): MatchingExercise {
    // Uses all 6 words
  }

  createListenWrite(words: Word[]): ListenWriteExercise {
    // Uses subset of words
  }

  createListenSelectImage(words: Word[]): ListenSelectImageExercise {
    // Uses subset of words
  }
}
```

### Phase 2: Backend Integration (Week 2-3)

#### 2.1 Create APIs

- `GET /themes` - List all themes
- `GET /themes/:id/blocks` - Get blocks for theme
- `GET /blocks/:id/exercises` - Generate exercises for block
- `POST /progress/word` - Update word progress
- `GET /progress/review` - Get words for spaced repetition

#### 2.2 Implement Spaced Repetition Algorithm

```typescript
// SM-2 Algorithm variant
calculateNextReview(progress: WordProgress, isCorrect: boolean): Date {
  if (isCorrect) {
    progress.successCount++;
    const interval = Math.pow(2, progress.successCount) * progress.easeFactor;
    return addDays(new Date(), interval);
  } else {
    progress.failureCount++;
    progress.successCount = 0;
    return addDays(new Date(), 1); // Review tomorrow
  }
}
```

### Phase 3: Frontend Updates (Week 3-4)

#### 3.1 Create Generic Exercise Renderer

```tsx
// frontend/app/components/ExerciseRenderer.tsx
<ExerciseRenderer
  type="MATCHING"
  data={exerciseData}
  onAnswer={handleAnswer}
/>

<ExerciseRenderer
  type="LISTEN_WRITE"
  data={exerciseData}
  onAnswer={handleAnswer}
/>

<ExerciseRenderer
  type="LISTEN_SELECT_IMAGE"
  data={exerciseData}
  onAnswer={handleAnswer}
/>
```

#### 3.2 Connect to Backend

- Replace hardcoded data with API calls
- Implement exercise loading states
- Add progress sync

### Phase 4: Polish & Features (Week 4-5)

- [ ] Add retry queue for failed questions (move to end)
- [ ] Add "heart lost" animation
- [ ] Add streak tracking
- [ ] Add achievements system
- [ ] Optimize Smart Repetition with spaced repetition data

---

## Part 6: Quick Wins (Can Be Done Today)

### 6.1 Fix Word Consistency (Hotfix)

Even before backend changes, you can fix the immediate problem:

```javascript
// In all exercises, use the SAME word pool:

const THEME_WORDS = [
  { id: "p1", fr: "Le papa", local: "Papá", image: "...", audio: "..." },
  {
    id: "p2",
    fr: "La tante",
    local: "Ndómɛ á tetɛ́",
    image: "...",
    audio: "..."
  },
  { id: "p3", fr: "La maman", local: "Mamá", image: "...", audio: "..." },
  { id: "p4", fr: "L'oncle", local: "Árí á tetɛ́", image: "...", audio: "..." },
  { id: "p5", fr: "Le frère", local: "Muna", image: "...", audio: "..." },
  { id: "p6", fr: "La sœur", local: "Sango", image: "...", audio: "..." }
];

// exos1: Use ALL 6 words for matching
// exos2: Pick 2-3 from the 6 for listening + writing
// exos3: Pick 1-2 from the 6 for image selection
```

### 6.2 Add Progressive Hint System

```javascript
// In exos2 (write exercise), add hints:
const hintLevels = [
  "P_p_", // 1st hint: missing letters
  "P__á", // 2nd hint: more letters
  "Papá" // 3rd hint: full answer
];
```

---

## Summary

### What's Done Well:

1. ✅ Gamification system (hearts, XP, scoring matrix)
2. ✅ Exercise UI/UX (matching, writing, selection)
3. ✅ Audio playback with error handling
4. ✅ Smart Repetition component
5. ✅ Failed exercise tracking
6. ✅ Good visual design

### Critical Issues:

1. ❌ **Words don't repeat across exercises** - breaks pedagogical model
2. ❌ **No database for words** - everything hardcoded
3. ❌ **No exercise generation engine** - can't scale
4. ❌ **No spaced repetition** - critical for memorization
5. ❌ **No backend integration** - frontend-only

### Priority Actions:

1. **HIGH**: Create word database schema
2. **HIGH**: Implement exercise generation with same word pool
3. **HIGH**: Add backend APIs for dynamic content
4. **MEDIUM**: Implement spaced repetition algorithm
5. **MEDIUM**: Create generic ExerciseRenderer component
6. **LOW**: Add achievements and streaks

---

_Document generated for Mulema Mobile App review_
_Target: Pedagogically sound, Duolingo-style language learning app_
