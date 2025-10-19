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
      setHistory(data.quizzes.reverse()); // Show newest first
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
