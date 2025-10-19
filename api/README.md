# QuizQuest API Server

Express REST API server for QuizQuest quiz generation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure `.env` file exists in parent directory with `ANTHROPIC_API_KEY`

3. Start development server:
```bash
npm run dev
```

4. Or build and run production:
```bash
npm run build
npm start
```

## Endpoints

### Health Check
```
GET /api/health
```

Returns server status and version information.

### Generate Quiz
```
POST /api/quiz/generate
Content-Type: application/json

{
  "topic": "JavaScript",
  "difficulty": "easy",
  "rounds": 5,
  "mode": "standard",
  "format": "multiple-choice",
  "content": "optional custom content",
  "file": "optional file path"
}
```

Parameters:
- `topic` (string, optional if content/file provided): Quiz topic
- `difficulty` (string, optional): "easy", "medium", or "hard" (default: "easy")
- `rounds` (number, optional): Number of questions 1-20 (default: 5)
- `mode` (string, optional): "standard" or "kid" (default: "standard")
- `format` (string, optional): "multiple-choice" or "true-false" (default: "multiple-choice")
- `content` (string, optional): Custom content to generate quiz from
- `file` (string, optional): File path to read content from

Returns:
```json
{
  "success": true,
  "topic": "JavaScript",
  "difficulty": "easy",
  "mode": "standard",
  "format": "multiple-choice",
  "rounds": 5,
  "questions": [
    {
      "question": "What is JavaScript?",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "..."
    }
  ]
}
```

### Load Quiz History
```
GET /api/history
```

Returns all saved quiz history.

### Save Quiz State
```
POST /api/history
Content-Type: application/json

{
  "topic": "JavaScript",
  "difficulty": "easy",
  "rounds": 5,
  "score": 80,
  "history": [],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "source": "topic",
  "questionFormat": "multiple-choice"
}
```

## Testing with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Generate quiz
curl -X POST http://localhost:3001/api/quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"topic": "Python", "difficulty": "easy", "rounds": 3}'

# Get history
curl http://localhost:3001/api/history

# Save quiz state
curl -X POST http://localhost:3001/api/history \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Python",
    "difficulty": "easy",
    "rounds": 3,
    "score": 100,
    "history": [],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "source": "topic",
    "questionFormat": "multiple-choice"
  }'
```
