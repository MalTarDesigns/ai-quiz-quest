const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizGenerateRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  numQuestions: number;
  format: 'multiple-choice' | 'true-false';
  mode: 'standard' | 'kid';
}

export interface QuizGenerateResponse {
  quiz: Quiz;
}

export interface QuizHistoryResponse {
  quizzes: Quiz[];
}

export async function generateQuiz(request: QuizGenerateRequest): Promise<QuizGenerateResponse> {
  const response = await fetch(`${API_URL}/api/quiz/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to generate quiz' }));
    throw new Error(error.error || 'Failed to generate quiz');
  }

  return response.json();
}

export async function getQuizHistory(): Promise<QuizHistoryResponse> {
  const response = await fetch(`${API_URL}/api/history`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch history' }));
    throw new Error(error.error || 'Failed to fetch history');
  }

  return response.json();
}
