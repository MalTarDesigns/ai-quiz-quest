'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateQuiz, type QuizGenerateRequest } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuizGenerateRequest>({
    topic: '',
    difficulty: 'medium',
    numQuestions: 5,
    format: 'multiple-choice',
    mode: 'standard',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);

    try {
      const response = await generateQuiz(formData);
      router.push(`/quiz/${response.quiz.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value, 10) : value,
    }));
  };

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
          Create Your Custom Quiz
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Generate personalized quizzes on any topic using AI-powered question generation
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <input
                id="topic"
                name="topic"
                type="text"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="e.g., World History, JavaScript, Biology"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions: {formData.numQuestions}
              </label>
              <input
                id="numQuestions"
                name="numQuestions"
                type="range"
                min="1"
                max="20"
                value={formData.numQuestions}
                onChange={handleInputChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                Question Format
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
              </select>
            </div>

            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-2">
                Mode
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="standard">Standard</option>
                <option value="kid">Kid-Friendly</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Generating Quiz...' : 'Generate Quiz'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold mb-2">Custom Topics</h3>
          <p className="text-gray-600 text-sm">
            Create quizzes on any subject you want to learn or test
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-3">🤖</div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
          <p className="text-gray-600 text-sm">
            Questions generated using advanced AI for relevant content
          </p>
        </div>

        <div className="card text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
          <p className="text-gray-600 text-sm">
            Review your quiz history and see how you improve over time
          </p>
        </div>
      </div>
    </div>
  );
}
