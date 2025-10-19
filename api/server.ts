import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import quizRoutes from './routes/quiz.js';
import historyRoutes from './routes/history.js';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'quizquest-api',
    version: '1.0.0'
  });
});

// Routes
app.use('/api/quiz', quizRoutes);
app.use('/api/history', historyRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QuizQuest API server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
