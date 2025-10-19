// Type Definitions
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
