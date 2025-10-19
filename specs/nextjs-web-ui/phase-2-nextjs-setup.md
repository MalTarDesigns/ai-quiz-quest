# Phase 2: Next.js Setup & Core Pages

## Objective

Initialize Next.js 14 project with App Router, configure Tailwind CSS, and create the Home page for quiz configuration.

## Dependencies

- Phase 1 completed (shared modules and API server)
- API server running on port 3001

## Implementation Steps

### Step 1: Create Next.js Application

```bash
npx create-next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Options:
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src/ directory
- ✅ Import alias (@/*)

### Step 2: Configure Tailwind for Mobile-First Design

**File:** `web/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
      },
    },
  },
  plugins: [],
}
export default config
```

### Step 3: Create Root Layout with Navigation

**File:** `web/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QuizQuest - AI-Powered Learning',
  description: 'Learn any topic through adaptive, AI-generated quizzes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl">🎓</span>
                  <span className="text-xl font-bold text-primary-600">QuizQuest</span>
                </Link>
                <div className="flex space-x-4">
                  <Link
                    href="/"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link
                    href="/history"
                    className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    History
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="mt-16 pb-8 text-center text-sm text-gray-500">
            <p>Powered by Claude AI</p>
          </footer>
        </div>
      </body>
    </html>
  )
}
```

### Step 4: Update Global Styles

**File:** `web/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply text-gray-900;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md;
  }

  .input-field {
    @apply w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow;
  }

  .card {
    @apply bg-white rounded-xl shadow-md p-6 border border-gray-100;
  }
}
```

### Step 5: Create API Client

**File:** `web/lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizGenerateRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  mode?: 'standard' | 'kid';
  format?: 'multiple-choice' | 'true-false';
}

export interface QuizGenerateResponse {
  success: boolean;
  questions: QuizQuestion[];
}

export interface QuizHistoryItem {
  topic: string;
  difficulty: string;
  rounds: number;
  score: number;
  timestamp: string;
  questionFormat?: string;
}

export async function generateQuiz(request: QuizGenerateRequest): Promise<QuizQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate quiz');
  }

  const data: QuizGenerateResponse = await response.json();
  return data.questions;
}

export async function getQuizHistory(): Promise<QuizHistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/history`);

  if (!response.ok) {
    throw new Error('Failed to load quiz history');
  }

  const data = await response.json();
  return data.history || [];
}
```

### Step 6: Create Home Page

**File:** `web/app/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateQuiz, QuizGenerateRequest } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<QuizGenerateRequest>({
    topic: '',
    difficulty: 'easy',
    rounds: 5,
    mode: 'standard',
    format: 'multiple-choice',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const questions = await generateQuiz(formData);

      // Store questions in sessionStorage
      sessionStorage.setItem('quiz-questions', JSON.stringify(questions));
      sessionStorage.setItem('quiz-topic', formData.topic);
      sessionStorage.setItem('quiz-difficulty', formData.difficulty);

      // Navigate to quiz page
      router.push('/quiz');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to QuizQuest
        </h1>
        <p className="text-lg text-gray-600">
          Learn any topic through AI-generated quizzes
        </p>
      </div>

      {/* Form Card */}
      <div className="card">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create Your Quiz
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Topic
            </label>
            <input
              id="topic"
              type="text"
              required
              className="input-field"
              placeholder="e.g., JavaScript, Solar System, World History"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            />
            <p className="mt-1 text-sm text-gray-500">What would you like to learn about?</p>
          </div>

          {/* Difficulty Select */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="input-field"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <label htmlFor="rounds" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions
            </label>
            <input
              id="rounds"
              type="number"
              min="1"
              max="20"
              required
              className="input-field"
              value={formData.rounds}
              onChange={(e) => setFormData({ ...formData, rounds: parseInt(e.target.value) })}
            />
            <p className="mt-1 text-sm text-gray-500">Between 1 and 20 questions</p>
          </div>

          {/* Question Format */}
          <div>
            <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
              Question Format
            </label>
            <select
              id="format"
              className="input-field"
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
            >
              <option value="multiple-choice">Multiple Choice (4 options)</option>
              <option value="true-false">True/False</option>
            </select>
          </div>

          {/* Mode */}
          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
              Mode
            </label>
            <select
              id="mode"
              className="input-field"
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
            >
              <option value="standard">Standard</option>
              <option value="kid">Kid-Friendly</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz...
              </span>
            ) : (
              'Start Quiz'
            )}
          </button>
        </form>
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="font-semibold text-gray-800 mb-1">AI-Generated</h3>
          <p className="text-sm text-gray-600">Questions powered by Claude AI</p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold text-gray-800 mb-1">Mobile-Friendly</h3>
          <p className="text-sm text-gray-600">Works great on any device</p>
        </div>
        <div className="text-center p-4">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-800 mb-1">Track Progress</h3>
          <p className="text-sm text-gray-600">View your quiz history</p>
        </div>
      </div>
    </div>
  );
}
```

### Step 7: Create Environment Configuration

**File:** `web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 8: Update Package Scripts

**File:** `web/package.json`

Add to scripts:
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint"
  }
}
```

## Testing

1. **Install dependencies:**
```bash
cd web
npm install
```

2. **Start Next.js dev server:**
```bash
npm run dev
```

3. **Test in browser:**
   - Open http://localhost:3000
   - Verify responsive design on mobile
   - Fill out quiz form
   - Check navigation works
   - Test form validation

4. **Test API connection:**
   - Make sure API server is running (port 3001)
   - Submit quiz form
   - Verify it calls the API endpoint

## Success Criteria

✅ Next.js 14 app created in `web/` directory
✅ Tailwind CSS configured with soft colors
✅ Responsive layout with navigation
✅ Home page displays correctly
✅ Form validates inputs
✅ Mobile-first design works on all screen sizes
✅ API client successfully calls backend
✅ Loading states implemented
✅ Error handling works

## Next Phase

Proceed to Phase 3: Quiz Experience & Polish
