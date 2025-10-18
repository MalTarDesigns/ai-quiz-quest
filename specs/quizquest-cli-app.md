# QuizQuest CLI App - Implementation Plan

## Problem Statement

Build a complete TypeScript/Node.js CLI application called QuizQuest that provides adaptive learning quizzes powered by Anthropic's Claude SDK. The app should offer an interactive, educational experience where users can learn any topic through progressively challenging multiple-choice questions, with scoring, explanations, and progress tracking.

## Objectives

- Create a production-ready CLI tool with Commander.js for parsing commands and options
- Integrate Anthropic's Claude API to generate adaptive, topic-specific quiz questions
- Provide an interactive terminal experience with chalk styling and inquirer prompts
- Track user progress and save quiz history to persistent storage
- Support different difficulty levels and learning modes (standard/kid-friendly)
- Implement robust error handling and graceful fallbacks

## Context & Existing Patterns

This is a greenfield project with no existing codebase. The implementation will follow standard TypeScript/Node.js CLI best practices:
- Strict TypeScript configuration for type safety
- Modular code structure with clear interfaces
- Async/await patterns for API interactions
- File-based persistence using Node.js fs.promises
- Environment variable configuration with dotenv

## Technical Approach

### Architecture

**Project Structure:**
```
ai-quiz-quest/
├── src/
│   └── index.ts          # Main entry point with CLI setup and quiz logic
├── .env                   # API key configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies (already configured)
└── quiz-history.json      # Persistent quiz history (generated)
```

**Core Components:**
1. CLI Command Handler (Commander.js)
2. Quiz Question Generator (Claude API integration)
3. Interactive Quiz Runner (inquirer + chalk)
4. State Management & Persistence (fs.promises)

### Technology Stack

- **CLI Framework:** Commander.js v11+ for command parsing
- **Prompts:** inquirer v9+ for interactive lists and confirmations
- **Styling:** chalk v5+ for colorful terminal output
- **AI Integration:** @anthropic-ai/sdk for Claude API
- **Runtime:** Node.js with TypeScript (ts-node for development)
- **Config:** dotenv for environment variables

### Data Models

```typescript
interface QuizQuestion {
  question: string;
  options: string[];      // Array of 4 options
  correct: number;        // Index 0-3
  explanation: string;
}

interface QuizState {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  score: number;          // Percentage 0-100
  history: string[];      // Array of topic strings for weak areas
}
```

### Claude API Integration

**Model:** claude-3-5-sonnet-20240620

**Prompt Strategy:**
- Request JSON array of QuizQuestion objects
- Specify topic, difficulty level, and number of questions
- For kid mode, instruct Claude to add fun analogies and simple language
- Make questions progressive (easier → harder within the set)
- Include clear instructions for JSON format to ensure parseable output

**Error Handling:**
- Wrap API calls in try/catch blocks
- Provide fallback questions if API fails
- Validate JSON response structure before parsing

## Implementation Steps

### Step 1: Project Configuration

**Files:** tsconfig.json, .env

Create TypeScript configuration:
- Set `strict: true` for maximum type safety
- Target ES2020 for modern JavaScript features
- Configure module resolution for Node.js
- Set output directory and source maps

Create environment configuration:
- Add .env file with ANTHROPIC_API_KEY placeholder
- Add .env to .gitignore (if git initialized)

**Success Criteria:**
- TypeScript compiles without errors
- Environment variables load correctly

### Step 2: Type Definitions & Interfaces

**File:** src/index.ts (top section)

Define core interfaces:
```typescript
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizState {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  score: number;
  history: string[];
}

type QuizMode = 'kid' | 'standard';
```

**Success Criteria:**
- All interfaces properly typed
- No type errors in definitions

### Step 3: Claude API Question Generator

**File:** src/index.ts (generator function)

Implement `generateQuestions` function:
- Accept parameters: topic, difficulty, rounds, mode
- Configure Anthropic client with API key from .env
- Construct prompt for Claude with:
  - Topic and difficulty specifications
  - Request for JSON array format
  - Progressive difficulty instruction
  - Kid-mode fun analogies (conditional)
- Call Claude API with messages.create()
- Parse JSON response safely with try/catch
- Return QuizQuestion[] array
- Implement fallback questions on API failure

**Error Handling:**
- Catch API errors and log gracefully
- Validate JSON structure before returning
- Provide 2-3 hardcoded fallback questions

**Success Criteria:**
- Successfully generates questions from Claude
- Returns valid QuizQuestion[] array
- Handles API failures gracefully

### Step 4: Interactive Quiz Runner

**File:** src/index.ts (quiz function)

Implement `runQuiz` function:
- Accept questions array and mode
- Initialize score counter
- Loop through questions:
  - Display question number with chalk.blue
  - Show question text
  - Format options as A, B, C, D
  - Use inquirer.list for option selection
  - Compare selection with correct answer
  - Show chalk.green for correct, chalk.red for wrong
  - Display explanation after each question
  - Update score counter
- Calculate final score percentage
- Display final score with chalk styling
- Return score percentage

**Styling Guidelines:**
- Blue: Question text
- Yellow: Prompts
- Green: Correct answers
- Red: Incorrect answers
- Cyan: Explanations

**Success Criteria:**
- Questions display one at a time
- User can select options interactively
- Immediate feedback after each answer
- Final score calculated correctly

### Step 5: State Persistence

**File:** src/index.ts (persistence functions)

Implement state management:
- `saveQuizHistory` function:
  - Accept QuizState object
  - Read existing quiz-history.json (if exists)
  - Append new state to array
  - Write back to file with fs.promises.writeFile
  - Handle file not found errors (create new)
- `loadQuizHistory` function (optional):
  - Read quiz-history.json
  - Parse and return history array

**Success Criteria:**
- Quiz history saves to JSON file
- Multiple quiz sessions append correctly
- File creates if doesn't exist

### Step 6: CLI Command Setup

**File:** src/index.ts (main section)

Implement Commander.js setup:
- Create program with version and description
- Define 'learn' command:
  - Argument: `<topic>` (required string)
  - Option: `-d, --difficulty <level>` (choices: easy|medium|hard, default: easy)
  - Option: `-r, --rounds <number>` (default: 5)
  - Option: `--mode <mode>` (choices: kid|standard, default: standard)
- Command action handler:
  - Load environment variables (dotenv.config())
  - Validate ANTHROPIC_API_KEY exists
  - Generate questions via generateQuestions()
  - Run quiz via runQuiz()
  - Calculate score
  - If score < 80%, prompt for deeper quiz with inquirer.confirm
  - Save state via saveQuizHistory()
- Parse process.argv

**Success Criteria:**
- CLI accepts all arguments and options
- Defaults work correctly
- Help text displays properly
- Command executes full quiz flow

### Step 7: Post-Quiz Flow & Weak Areas

**File:** src/index.ts (post-quiz logic)

Implement follow-up quiz logic:
- After displaying final score, check if < 80%
- Use inquirer.confirm to ask: "Would you like a deeper quiz on challenging concepts?"
- If yes:
  - Identify weak areas from incorrect answers (could be topic itself)
  - Append to history array
  - Optionally trigger new quiz generation (recursive or iterative)
- Save complete QuizState with history to quiz-history.json

**Success Criteria:**
- Score threshold triggers follow-up prompt
- User can accept or decline
- History tracks weak topics
- State saves regardless of choice

### Step 8: Sample Data & Testing

**Files:** quiz-history.json (sample), src/index.ts (manual testing)

Create sample quiz-history.json:
```json
[
  {
    "topic": "Angular RxJS",
    "difficulty": "medium",
    "rounds": 5,
    "score": 60,
    "history": ["Angular RxJS"]
  }
]
```

Manual testing checklist:
- Run: `npx ts-node src/index.ts learn "Angular services"`
- Test all difficulty levels
- Test kid mode vs standard mode
- Test rounds option
- Verify score calculation
- Verify file persistence
- Test API failure scenario (invalid key)
- Test < 80% follow-up prompt

**Success Criteria:**
- All CLI options work as expected
- Questions generate correctly
- Interactive flow smooth
- History saves properly
- Errors handled gracefully

## Potential Challenges & Solutions

### Challenge 1: Claude API JSON Parsing
**Risk:** Claude might return malformed JSON or include markdown formatting
**Solution:**
- Use try/catch around JSON.parse()
- Validate structure with type guards
- Strip markdown code blocks if present (```json markers)
- Fallback to hardcoded questions on parse failure

### Challenge 2: Question Quality
**Risk:** Generated questions might be too easy/hard or poorly formatted
**Solution:**
- Craft detailed prompts with examples
- Specify exact JSON structure in prompt
- Test with various topics and difficulties
- Adjust prompt based on output quality

### Challenge 3: Terminal Compatibility
**Risk:** Chalk colors might not display on all terminals
**Solution:**
- Chalk automatically detects color support
- Falls back to plain text gracefully
- Test on multiple terminal types (Git Bash, PowerShell, CMD)

### Challenge 4: Rate Limiting
**Risk:** Anthropic API might rate limit requests
**Solution:**
- Add error handling for rate limit errors
- Implement exponential backoff (optional enhancement)
- Cache questions for same topic (future enhancement)

## Testing Strategy

### Manual Testing (Current Scope)
- Test all CLI flags and options
- Verify question generation for multiple topics
- Test both kid and standard modes
- Verify score calculation accuracy
- Test file persistence across multiple runs
- Test error scenarios (missing API key, invalid options)

### Future Unit Testing (Out of Scope)
- Mock Claude API responses
- Test question parsing logic
- Test score calculation
- Test file I/O operations
- 80%+ code coverage target

## Success Criteria

### Functional Requirements
✅ CLI accepts topic, difficulty, rounds, and mode options
✅ Generates adaptive questions via Claude API
✅ Displays interactive quiz with styled output
✅ Calculates and displays score percentage
✅ Prompts for follow-up quiz if score < 80%
✅ Saves quiz history to JSON file

### Technical Requirements
✅ TypeScript strict mode with no errors
✅ Proper error handling for API and file operations
✅ Environment variable configuration
✅ Runnable via `npx ts-node src/index.ts`
✅ Production-ready code quality

### User Experience
✅ Clear, colorful terminal output
✅ Smooth interactive flow
✅ Immediate feedback on answers
✅ Educational explanations
✅ Fun kid-friendly mode option

## Deliverables

1. **src/index.ts** - Complete CLI application with:
   - Type definitions
   - Claude API integration
   - Interactive quiz logic
   - State persistence
   - Commander.js setup

2. **tsconfig.json** - TypeScript configuration:
   - Strict mode enabled
   - ES2020 target
   - Node module resolution

3. **quiz-history.json** - Sample quiz history:
   - Example quiz state object
   - Demonstrates JSON structure

## Next Steps

1. Review this implementation plan
2. Execute implementation via `/development:build specs/quizquest-cli-app.md`
3. Test the CLI application manually
4. Create .env file with actual API key
5. Run sample quiz: `npx ts-node src/index.ts learn "Angular RxJS" -d medium`
6. Verify quiz-history.json creation and updates

## Estimated Effort

- **Configuration:** 10 minutes
- **Type Definitions:** 5 minutes
- **API Integration:** 30 minutes
- **Quiz Runner:** 30 minutes
- **State Persistence:** 15 minutes
- **CLI Setup:** 20 minutes
- **Testing & Refinement:** 20 minutes
- **Total:** ~2 hours

## Notes

- This is a complete, self-contained implementation
- All dependencies already installed per requirements
- Focus on clean, readable code over premature optimization
- Error messages should be user-friendly
- Consider adding --help documentation for better UX
- Future enhancements could include quiz statistics, leaderboards, or topic recommendations
