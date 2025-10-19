'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveQuizResult } from '@/lib/api';

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
    const storedFormat = sessionStorage.getItem('quiz-format');

    if (!storedScore || !storedTotal) {
      router.push('/');
      return;
    }

    const scoreValue = parseInt(storedScore);
    const totalValue = parseInt(storedTotal);

    setScore(scoreValue);
    setTotal(totalValue);
    setTopic(storedTopic || '');
    setDifficulty(storedDifficulty || '');

    // Save quiz result to history
    saveQuizResult({
      topic: storedTopic || '',
      difficulty: storedDifficulty || '',
      rounds: totalValue,
      score: scoreValue,
      questionFormat: storedFormat || undefined,
    }).catch((error) => {
      console.error('Failed to save quiz result:', error);
    });

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
