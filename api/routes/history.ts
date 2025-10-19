import express, { Request, Response } from 'express';
import { saveQuizHistory, loadQuizHistory } from '../../src/shared/file-utils.js';
import { QuizState } from '../../src/shared/types.js';

const router = express.Router();

// GET /api/history - Load quiz history
router.get('/', async (req: Request, res: Response) => {
  try {
    const history = await loadQuizHistory();
    res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('History load error:', error);
    res.status(500).json({
      error: 'History Load Error',
      message: error instanceof Error ? error.message : 'Failed to load quiz history'
    });
  }
});

// POST /api/history - Save quiz state
router.post('/', async (req: Request, res: Response) => {
  try {
    const quizState: QuizState = req.body;

    // Validate required fields
    if (!quizState.topic || !quizState.difficulty || !quizState.rounds ||
        quizState.score === undefined || !quizState.timestamp || !quizState.source) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Missing required fields in quiz state'
      });
    }

    await saveQuizHistory(quizState);

    res.json({
      success: true,
      message: 'Quiz history saved successfully'
    });
  } catch (error) {
    console.error('History save error:', error);
    res.status(500).json({
      error: 'History Save Error',
      message: error instanceof Error ? error.message : 'Failed to save quiz history'
    });
  }
});

export default router;
