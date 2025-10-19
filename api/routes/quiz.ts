import express, { Request, Response } from 'express';
import { generateQuestions, generateTopicFromContent } from '../../src/shared/quiz.js';
import { readFileContent } from '../../src/shared/file-utils.js';
import { QuizMode, QuestionFormat } from '../../src/shared/types.js';

const router = express.Router();

// Request validation middleware
function validateGenerateRequest(req: Request, res: Response, next: express.NextFunction) {
  const { topic, difficulty, rounds, mode, format } = req.body;

  // Validate difficulty
  if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid difficulty. Must be: easy, medium, or hard'
    });
  }

  // Validate rounds
  if (rounds !== undefined) {
    const roundsNum = parseInt(rounds, 10);
    if (isNaN(roundsNum) || roundsNum < 1 || roundsNum > 20) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid rounds. Must be a number between 1 and 20'
      });
    }
  }

  // Validate mode
  if (mode && !['kid', 'standard'].includes(mode)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid mode. Must be: standard or kid'
    });
  }

  // Validate format
  if (format && !['multiple-choice', 'true-false'].includes(format)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid format. Must be: multiple-choice or true-false'
    });
  }

  next();
}

// POST /api/quiz/generate - Generate quiz questions
router.post('/generate', validateGenerateRequest, async (req: Request, res: Response) => {
  try {
    const {
      topic,
      difficulty = 'easy',
      rounds = 5,
      mode = 'standard',
      format = 'multiple-choice',
      content,
      file
    } = req.body;

    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      return res.status(500).json({
        error: 'Configuration Error',
        message: 'Anthropic API key not configured on server'
      });
    }

    let quizContent = content;
    let quizTopic = topic;

    // If file path provided, read the file
    if (file) {
      try {
        quizContent = await readFileContent(file);
      } catch (error) {
        return res.status(400).json({
          error: 'File Error',
          message: error instanceof Error ? error.message : 'Failed to read file'
        });
      }
    }

    // If content provided but no topic, generate topic from content
    if (quizContent && !quizTopic) {
      try {
        quizTopic = await generateTopicFromContent(quizContent, apiKey);
      } catch (error) {
        return res.status(500).json({
          error: 'Topic Generation Error',
          message: error instanceof Error ? error.message : 'Failed to generate topic from content'
        });
      }
    }

    // Validate topic
    if (!quizTopic) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Topic is required if no content or file is provided'
      });
    }

    // Generate questions
    const questions = await generateQuestions(
      quizTopic,
      difficulty as 'easy' | 'medium' | 'hard',
      parseInt(rounds, 10),
      mode as QuizMode,
      format as QuestionFormat,
      apiKey,
      quizContent
    );

    res.json({
      quiz: {
        id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        topic: quizTopic,
        difficulty,
        mode,
        format,
        questions,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      error: 'Quiz Generation Error',
      message: error instanceof Error ? error.message : 'Failed to generate quiz questions'
    });
  }
});

export default router;
