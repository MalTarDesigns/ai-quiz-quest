# Phase 3: Quiz Experience & Polish

## Objective

Build the quiz-taking interface, results display, and quiz history page. Add final polish with loading states, error handling, and accessibility features.

## Dependencies

- Phase 1 completed (shared modules and API server)
- Phase 2 completed (Next.js setup and Home page)
- API server running on port 3001
- Next.js dev server running on port 3000

## Implementation Steps

### Step 1: Create Quiz Page

**File:** `web/app/quiz/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuizQuestion } from '@/lib/api';

export default function QuizPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    // Load quiz data from sessionStorage
    const storedQuestions = sessionStorage.getItem('quiz-questions');
    const storedTopic = sessionStorage.getItem('quiz-topic');
    const storedDifficulty = sessionStorage.getItem('quiz-difficulty');

    if (!storedQuestions) {
      router.push('/');
      return;
    }

    setQuestions(JSON.parse(storedQuestions));
    setTopic(storedTopic || '');
    setDifficulty(storedDifficulty || '');
  }, [router]);

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  const handleAnswerSelect = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    setShowExplanation(true);

    if (selectedAnswer === question.correct) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Save score to sessionStorage and navigate to results
      sessionStorage.setItem('quiz-score', score.toString());
      sessionStorage.setItem('quiz-total', questions.length.toString());
      router.push('/results');
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{topic}</h1>
          <span className="text-sm text-gray-600 font-medium capitalize">{difficulty}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary-600 h-2 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Question Card */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {question.question}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showAsCorrect = showExplanation && isCorrect;
            const showAsWrong = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200 ${
                  showAsCorrect
                    ? 'border-green-500 bg-green-50 text-green-900'
                    : showAsWrong
                    ? 'border-red-500 bg-red-50 text-red-900'
                    : isSelected
                    ? 'border-primary-500 bg-primary-50 text-primary-900'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showAsCorrect && <span className="text-green-600">✓</span>}
                  {showAsWrong && <span className="text-red-600">✗</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Explanation</h3>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          Quit Quiz
        </button>

        {!showExplanation ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === null}
            className="btn-primary"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {isLastQuestion ? 'See Results' : 'Next Question →'}
          </button>
        )}
      </div>

      {/* Current Score */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Current Score: <span className="font-semibold text-primary-600">{score}</span> /{' '}
          {currentQuestion + (showExplanation ? 1 : 0)}
        </p>
      </div>
    </div>
  );
}
```

### Step 2: Create Results Page

**File:** `web/app/results/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    const storedScore = sessionStorage.getItem('quiz-score');
    const storedTotal = sessionStorage.getItem('quiz-total');
    const storedTopic = sessionStorage.getItem('quiz-topic');
    const storedDifficulty = sessionStorage.getItem('quiz-difficulty');

    if (!storedScore || !storedTotal) {
      router.push('/');
      return;
    }

    setScore(parseInt(storedScore));
    setTotal(parseInt(storedTotal));
    setTopic(storedTopic || '');
    setDifficulty(storedDifficulty || '');

    // Clear sessionStorage
    // sessionStorage.removeItem('quiz-questions');
    // sessionStorage.removeItem('quiz-score');
    // sessionStorage.removeItem('quiz-total');
  }, [router]);

  if (total === 0) {
    return null;
  }

  const percentage = Math.round((score / total) * 100);

  let message = '';
  let emoji = '';
  let colorClass = '';

  if (percentage === 100) {
    message = "Perfect score! You're a master of this topic!";
    emoji = '🏆';
    colorClass = 'text-yellow-600';
  } else if (percentage >= 80) {
    message = 'Great job! You have a strong understanding!';
    emoji = '🌟';
    colorClass = 'text-green-600';
  } else if (percentage >= 60) {
    message = 'Good effort! Some areas need more practice.';
    emoji = '👍';
    colorClass = 'text-blue-600';
  } else {
    message = 'Keep learning! This topic needs more study.';
    emoji = '📚';
    colorClass = 'text-orange-600';
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Results Card */}
      <div className="card">
        <div className="text-6xl mb-4">{emoji}</div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>

        <div className="my-8">
          <div className="inline-block">
            <div className="text-7xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {percentage}%
            </div>
          </div>

          <p className="text-2xl text-gray-700 mt-4">
            {score} out of {total} correct
          </p>
        </div>

        <p className={`text-xl font-semibold ${colorClass} mb-8`}>{message}</p>

        {/* Quiz Info */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-800 mb-3">Quiz Summary</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Topic:</span> {topic}
            </p>
            <p className="capitalize">
              <span className="font-medium">Difficulty:</span> {difficulty}
            </p>
            <p>
              <span className="font-medium">Questions:</span> {total}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary inline-block">
            Take Another Quiz
          </Link>
          <Link href="/history" className="btn-secondary inline-block">
            View History
          </Link>
        </div>
      </div>

      {/* Motivational Section */}
      {percentage < 80 && (
        <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-lg">
          <h3 className="font-semibold text-primary-900 mb-2">Keep Going!</h3>
          <p className="text-primary-800 text-sm">
            Practice makes perfect. Try taking another quiz on this topic to reinforce your
            learning.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Quiz History Page

**File:** `web/app/history/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getQuizHistory, QuizHistoryItem } from '@/lib/api';
import Link from 'next/link';

export default function HistoryPage() {
  const [history, setHistory] = useState<QuizHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getQuizHistory();
      setHistory(data.reverse()); // Show newest first
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quiz History</h1>
        <Link href="/" className="btn-primary">
          New Quiz
        </Link>
      </div>

      {error && (
        <div className="card mb-6 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {history.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No quiz history yet</h2>
          <p className="text-gray-600 mb-6">Take your first quiz to start tracking your progress!</p>
          <Link href="/" className="btn-primary inline-block">
            Start a Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => {
            const percentage = Math.round((item.score / item.rounds) * 100);
            const date = new Date(item.timestamp).toLocaleDateString();
            const time = new Date(item.timestamp).toLocaleTimeString();

            return (
              <div key={index} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.topic}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="capitalize">
                        <span className="font-medium">Difficulty:</span> {item.difficulty}
                      </span>
                      <span>
                        <span className="font-medium">Questions:</span> {item.rounds}
                      </span>
                      {item.questionFormat && (
                        <span className="capitalize">
                          <span className="font-medium">Format:</span>{' '}
                          {item.questionFormat.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {date} at {time}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-600">{percentage}%</div>
                      <p className="text-sm text-gray-600">
                        {item.score}/{item.rounds}
                      </p>
                    </div>

                    <div className="text-3xl">
                      {percentage === 100 ? '🏆' : percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### Step 4: Add Loading Component

**File:** `web/components/Loading.tsx`

```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
```

### Step 5: Add Accessibility Features

Update all interactive elements to include:
- Proper ARIA labels
- Keyboard navigation support
- Focus states
- Screen reader announcements

### Step 6: Add Meta Tags for SEO

**File:** `web/app/page.tsx` (add to top)

```typescript
export const metadata = {
  title: 'QuizQuest - AI-Powered Learning Quizzes',
  description: 'Learn any topic through adaptive, AI-generated quizzes powered by Claude AI. Mobile-friendly and easy to use.',
  keywords: 'quiz, learning, AI, education, study, test',
};
```

### Step 7: Test Complete User Flow

1. **Start Quiz Flow:**
   - Go to homepage
   - Fill out quiz form
   - Submit to generate quiz
   - Verify loading state

2. **Take Quiz Flow:**
   - Answer questions
   - See explanations
   - Navigate through all questions
   - Complete quiz

3. **Results Flow:**
   - View final score
   - See percentage and message
   - Check quiz summary
   - Navigate to history

4. **History Flow:**
   - View all past quizzes
   - See scores and dates
   - Navigate back to home

## Testing Checklist

✅ Mobile responsive (test on 320px, 768px, 1024px widths)
✅ Keyboard navigation works
✅ Loading states display correctly
✅ Error handling works
✅ Quiz flow completes successfully
✅ Results calculate correctly
✅ History loads and displays
✅ Navigation between pages works
✅ Back button behavior is correct
✅ Session storage handled properly
✅ Colors are soft and easy on eyes
✅ Text is readable
✅ Buttons have hover states
✅ Forms validate inputs

## Success Criteria

✅ Quiz page fully functional
✅ Results page displays correct score
✅ History page shows all past quizzes
✅ Complete user flow works end-to-end
✅ Mobile-first design responsive on all devices
✅ Loading and error states implemented
✅ Accessibility features added
✅ Clean, simple, user-friendly interface
✅ Smooth transitions and interactions
✅ No console errors
✅ SEO meta tags added

## Final Polish

- Test on real mobile devices
- Verify API error handling
- Check all edge cases
- Ensure consistent spacing
- Validate color contrast for accessibility
- Test with screen readers
- Performance optimization

## Deployment

After testing is complete, the application is ready for deployment:
- Next.js app can be deployed to Vercel
- API server can be deployed to any Node.js hosting
- Update environment variables for production

## Completion

All three phases are now complete! The QuizQuest web UI is fully functional with:
- Simple, mobile-first design
- Clean, user-friendly interface
- Full quiz-taking experience
- Results and history tracking
- No database required
