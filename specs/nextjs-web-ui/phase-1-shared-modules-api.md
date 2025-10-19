# Phase 1: Shared Modules & API Server

## Objective

Extract shared quiz logic from the CLI into reusable modules and create an Express API server that wraps this logic with REST endpoints.

## Dependencies

None (this is the foundation phase)

## Implementation Steps

### Step 1: Create Shared Module Structure

Create the directory structure for shared code:

```bash
mkdir -p src/shared
```

### Step 2: Extract TypeScript Interfaces

**File:** `src/shared/types.ts`

Extract interfaces from `src/index.ts` (lines 18-42):

```typescript
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizState {
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

export type QuizMode = 'kid' | 'standard';
export type QuestionFormat = 'multiple-choice' | 'true-false';
export type ContentSource = 'topic' | 'web' | 'file' | 'url';

export interface ContentSourceOptions {
  source: ContentSource;
  file?: string;
  url?: string;
}
```

### Step 3: Extract Quiz Generation Logic

**File:** `src/shared/quiz.ts`

Extract the `generateQuestions` function from `src/index.ts` (lines 193-354). Create a reusable version that accepts an API key parameter.

### Step 4: Extract File Utilities

**File:** `src/shared/file-utils.ts`

Extract file reading and history functions:
- `readFileContent()` (lines 52-108)
- `readDocxFile()` (lines 110-126)
- `readPdfFile()` (lines 128-140)
- `saveQuizHistory()` (lines 429-449)
- `loadQuizHistory()` (lines 453-462)

### Step 5: Update CLI to Use Shared Modules

**File:** `src/index.ts`

Update imports to use shared modules:
```typescript
import { QuizQuestion, QuizState, QuizMode, QuestionFormat, ContentSource } from './shared/types.js';
import { generateQuestions } from './shared/quiz.js';
import { readFileContent, saveQuizHistory } from './shared/file-utils.js';
```

Remove the extracted code and update function calls.

### Step 6: Create Express API Server

Create `api/` directory with Express server:

**File:** `api/package.json`
```json
{
  "name": "quizquest-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

**File:** `api/server.ts`
- Setup Express app with CORS
- Add health check endpoint
- Import and mount quiz routes
- Listen on port 3001

**File:** `api/routes/quiz.ts`
- POST `/api/quiz/generate` - Generate quiz questions
- Validate request body
- Call `generateQuestions()` from shared modules
- Return JSON response

**File:** `api/routes/history.ts`
- GET `/api/history` - Load quiz history
- POST `/api/history` - Save quiz state
- Use shared `loadQuizHistory()` and `saveQuizHistory()`

**File:** `api/tsconfig.json`
- Extend root tsconfig
- Include shared modules

## Testing

1. Install API dependencies: `cd api && npm install`
2. Start API server: `npm run dev`
3. Test with curl:
   ```bash
   curl -X POST http://localhost:3001/api/quiz/generate \
     -H "Content-Type: application/json" \
     -d '{"topic": "JavaScript", "difficulty": "easy", "rounds": 3}'
   ```
4. Verify CLI still works: `npm run dev learn "Python" -d easy -r 3`

## Success Criteria

✅ Shared modules created in `src/shared/`
✅ CLI updated to use shared modules
✅ CLI functionality unchanged
✅ Express API server running on port 3001
✅ Quiz generation endpoint working
✅ History endpoint working
✅ Proper error handling

## Next Phase

Proceed to Phase 2: Next.js Setup & Core Pages
