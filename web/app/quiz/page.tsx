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
                    ? 'border-primary-500 bg-primary-50 text-gray-900'
                    : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50 text-gray-900'
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
