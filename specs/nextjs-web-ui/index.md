# QuizQuest Web UI Implementation Plan

## Overview

Create a simple, mobile-first Next.js web UI that connects to the existing QuizQuest CLI application through an Express API server. No database required - the UI will interact with the CLI logic via REST API endpoints.

## Objectives

- Build a clean, minimalist web interface for QuizQuest
- Mobile-first responsive design with soft colors and easy navigation
- Connect to existing quiz logic without modifying CLI functionality
- Reuse existing dependencies and patterns
- No database - use existing quiz-history.json file

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js 14 Web UI                   │
│                   (App Router + Tailwind)                │
│  Pages: Home → Quiz → Results                           │
└────────────────┬────────────────────────────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────────────────────────────┐
│                  Express API Server                      │
│   Routes: POST /api/quiz/generate                       │
│          GET  /api/quiz/history                         │
└────────────────┬────────────────────────────────────────┘
                 │ Function Calls
                 ↓
┌─────────────────────────────────────────────────────────┐
│              Shared Quiz Logic Modules                  │
│  - generateQuestions()                                  │
│  - QuizQuestion, QuizState interfaces                   │
│  - readFileContent(), saveQuizHistory()                 │
└─────────────────────────────────────────────────────────┘
```

## Context & Existing Patterns

**From:** `C:\projects\ai-quiz-quest\src\index.ts`

### Interfaces to Reuse
```typescript
// Lines 18-23
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Lines 25-35
interface QuizState {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  score: number;
  history: string[];
  timestamp: string;
  source: ContentSource;
  sourceDetails?: string;
  questionFormat?: QuestionFormat;
}
```

### Functions to Reuse
- `generateQuestions()` - Lines 193-354
- `readFileContent()` - Lines 52-108
- `saveQuizHistory()` - Lines 429-449
- `generateTopicFromContent()` - Lines 164-191

### Dependencies to Reuse
- `@anthropic-ai/sdk` (^0.30.1)
- `dotenv` (^16.3.1)

## Phase Breakdown

### Phase 1: Shared Modules & API Server (Foundation)
**Objective:** Extract shared logic and create Express API server

**Steps:**
1. Create `src/shared/` directory structure
2. Extract TypeScript interfaces and types
3. Extract core quiz functions
4. Create Express API server in `api/` directory
5. Implement API routes for quiz generation and history

**Deliverables:**
- Shared modules that both CLI and web UI can use
- Working Express API server
- API endpoints tested via Postman/curl

---

### Phase 2: Next.js Setup & Core Pages (UI Foundation)
**Objective:** Initialize Next.js project with basic pages

**Steps:**
1. Create Next.js 14 app in `web/` directory
2. Configure Tailwind CSS with mobile-first theme
3. Create layout with simple navigation
4. Build Home page (quiz configuration form)
5. Setup TypeScript types and API client

**Deliverables:**
- Next.js project structure
- Responsive layout with navigation
- Home page for starting quizzes

---

### Phase 3: Quiz Experience & Polish (Complete Features)
**Objective:** Build quiz-taking interface and results display

**Steps:**
1. Create Quiz page with question display
2. Implement answer selection and validation
3. Create Results page with score display
4. Add loading states and error handling
5. Final styling polish and accessibility

**Deliverables:**
- Complete quiz-taking flow
- Results display with history
- Polished, accessible UI

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS (mobile-first)
- **API Server:** Express.js
- **AI Integration:** Anthropic SDK (existing)
- **State Management:** React hooks (useState, useEffect)
- **File Storage:** quiz-history.json (existing)

## Success Criteria

✅ CLI functionality remains unchanged
✅ Web UI is fully responsive (mobile, tablet, desktop)
✅ Simple, clean design with soft colors
✅ Easy navigation between pages
✅ Quiz generation works via API
✅ Quiz history displays correctly
✅ No database required
✅ Existing dependencies reused

## Project Structure

```
ai-quiz-quest/
├── src/
│   ├── shared/              # NEW: Shared modules
│   │   ├── types.ts         # QuizQuestion, QuizState interfaces
│   │   ├── quiz.ts          # generateQuestions function
│   │   └── file-utils.ts    # readFileContent, saveQuizHistory
│   └── index.ts             # CLI (updated to use shared modules)
├── api/                     # NEW: Express API server
│   ├── server.ts            # Main Express app
│   ├── routes/
│   │   ├── quiz.ts          # Quiz generation endpoints
│   │   └── history.ts       # History endpoints
│   └── package.json
├── web/                     # NEW: Next.js application
│   ├── app/
│   │   ├── layout.tsx       # Root layout with navigation
│   │   ├── page.tsx         # Home page
│   │   ├── quiz/
│   │   │   └── page.tsx     # Quiz page
│   │   └── results/
│   │       └── page.tsx     # Results page
│   ├── components/          # React components
│   ├── lib/
│   │   └── api.ts           # API client functions
│   ├── package.json
│   └── tailwind.config.ts
├── quiz-history.json        # Existing history file
├── package.json             # Root package.json
└── README.md                # Updated documentation
```

## Timeline

- **Phase 1:** Shared Modules & API Server - ~2-3 hours
- **Phase 2:** Next.js Setup & Core Pages - ~2-3 hours
- **Phase 3:** Quiz Experience & Polish - ~2-3 hours

**Total Estimated Time:** 6-9 hours

## Next Steps

1. Start with Phase 1: `/development:build specs/nextjs-web-ui/phase-1-shared-modules-api.md`
2. After Phase 1 completion, proceed to Phase 2
3. Complete with Phase 3
4. Test the complete flow
5. Update documentation
