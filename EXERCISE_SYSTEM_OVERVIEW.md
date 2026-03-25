# Mulema Exercise System - Technical Overview

## Overview

The Mulema language learning app implements a pedagogically-sound exercise system based on spaced repetition and intelligent word reuse across exercise types.

---

## Pedagogical Foundation

### Learning Objective

A beginner (someone who has never learned the language) should be able to:

- ✅ Recognize words
- ✅ Write words
- ✅ Associate words with images
- ✅ Pronounce words
- ✅ Remember words long-term

### Core Principle: Intelligent Repetition

A word must be seen **5-7 times** in different forms to be memorized. The system achieves this by using the **same 6-word block** across all three exercises in a theme.

---

## Theme Structure

### Word Block (6 words per block)

Each theme is organized into blocks of 6 words maximum. Example for "Famille" theme:

| #   | French           | Duala (Target) |
| --- | ---------------- | -------------- |
| 1   | le père          | ba             |
| 2   | la mère          | ma             |
| 3   | le frère         | nde            |
| 4   | la sœur          | mu             |
| 5   | le bébé          | moto           |
| 6   | les grandparents | ndame          |

---

## Exercise Flow (3 Pages)

### Page 1: Matching Exercise (exos1.jsx)

**Goal**: Discovery + Recognition

**Exercise Type**: Drag-and-drop word matching

**Content**:

- 6 target words displayed
- 6 source words to match
- Visual interface with cards

**Pedagogical Purpose**:

- First exposure to all 6 words
- Visual association between written forms
- Low cognitive load (recognition only)

---

### Page 2: Writing Exercise (exos2.jsx)

**Goal**: Guided Production

**Exercise Type**: Fill-in-the-blank / Write the translation

**Content**:

- Same 6 words from Page 1
- Question-by-question format
- Immediate feedback

**Questions per word**:

1. Show French word → Type Duala translation
2. Show Duala word → Type French translation
3. Multiple choice variant

**Pedagogical Purpose**:

- Active recall through writing
- Reinforcement of visual learning
- Error detection and correction

---

### Page 3: Image Selection Exercise (exos3.jsx)

**Goal**: Active Consolidation

**Exercise Type**: Listen and select correct image

**Content**:

- Audio pronunciation for each word
- 4 image options (1 correct, 3 distractors)
- Same 6 words from Pages 1 & 2

**Pedagogical Purpose**:

- Audio-visual association
- Real-world context (images)
- Listening comprehension

---

### End Exercise Screen (endexos.jsx)

**Goal**: Summary + Next Steps

**Content**:

- Score breakdown (XP earned)
- Accuracy statistics
- Smart repetition scheduling
- Navigation to next block

---

## Gamification System

### XP Points (Crevettes)

Based on **accuracy** and **time**:

| Accuracy | Time < 2min | Time > 2min |
| -------- | ----------- | ----------- |
| 100%     | 700 XP      | 620 XP      |
| 90%      | 570 XP      | 520 XP      |
| 79%      | 480 XP      | 420 XP      |
| 59%      | 390 XP      | 340 XP      |
| 45%      | 270 XP      | 230 XP      |

### Hearts (Cauris)

- **Starting hearts**: 5
- **Lost per wrong answer**: 1
- **Recharge time**: 9 minutes per heart
- **Full recharge**: ~45 minutes

### Failed Exercise Retry

- Failed exercises move to end of queue
- "Let's review your mistakes" message
- Ensures all questions are answered correctly

---

## Spaced Repetition (SM-2 Algorithm)

### Purpose

Words that are difficult for the user appear more frequently until mastered.

### How It Works

1. Each word tracks:
   - `successCount`: Times answered correctly
   - `failureCount`: Times answered incorrectly
   - `nextReviewDate`: When to show again

2. Review intervals:
   - Day 1 → Day 3 → Day 7 → Day 14 → Day 30

3. Failed words reset to shorter intervals

---

## Backend Integration

### Database Schema

```
Word
├── id
├── themeId
├── sourceText (French)
├── targetText (Duala)
├── imageUrl
├── audioUrl
└── difficultyLevel

LearningBlock
├── id
├── themeId
└── words[] (relation)

WordProgress
├── wordId
├── userId
├── successCount
├── failureCount
└── nextReviewDate
```

### API Endpoints

- `POST /exercise/generate` - Generate exercises for a block
- `POST /exercise/submit` - Submit answers
- `GET /progress/:userId` - Get user progress
- `POST /progress/review` - Schedule word for review

---

## Data Flow

```
Theme Selection
    ↓
Load 6-Word Block
    ↓
┌─────────────────────────────────────┐
│  Page 1: Matching (exos1.jsx)       │
│  - All 6 words                     │
│  - Visual recognition              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Page 2: Writing (exos2.jsx)       │
│  - Same 6 words                   │
│  - Active production              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Page 3: Selection (exos3.jsx)    │
│  - Same 6 words                   │
│  - Audio + image                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  End Screen (endexos.jsx)         │
│  - Score calculation              │
│  - Spaced repetition scheduling  │
│  - XP update                     │
└─────────────────────────────────────┘
    ↓
Future Sessions → Spaced Repetition
```

---

## Key Files

| File                                | Purpose                |
| ----------------------------------- | ---------------------- |
| `app/data/themeData.js`             | 6-word pool definition |
| `app/exercices/famille/exos1.jsx`   | Matching exercise      |
| `app/exercices/famille/exos2.jsx`   | Writing exercise       |
| `app/exercices/famille/exos3.jsx`   | Image selection        |
| `app/exercices/famille/endexos.jsx` | Results + scheduling   |
| `app/src/utils/scoring.js`          | XP calculation         |
| `app/hooks/useSpacedRepetition.js`  | SM-2 algorithm         |
| `app/hooks/useCowrie.jsx`           | Heart management       |
| `app/hooks/useFailedExercises.jsx`  | Retry queue            |

---

## Test Results

- **Backend Tests**: 13/13 passing ✅
- **Frontend Build**: Successful ✅

---

_Generated: March 2026_
