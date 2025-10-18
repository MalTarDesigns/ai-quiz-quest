# QuizQuest - AI-Powered Learning Quiz CLI

Interactive command-line quiz application powered by Anthropic's Claude AI. Learn any topic through adaptive, progressively challenging multiple-choice questions with instant feedback and explanations.

## Features

- **AI-Generated Questions**: Dynamic quiz generation using Claude AI
- **Adaptive Difficulty**: Choose from easy, medium, or hard difficulty levels
- **Kid-Friendly Mode**: Special mode with fun analogies and simple language
- **Interactive Experience**: Colorful, engaging terminal interface
- **Instant Feedback**: Immediate explanations after each question
- **Progress Tracking**: Automatic saving of quiz history
- **Smart Follow-ups**: Offers deeper practice on challenging topics

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-quiz-quest
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key:
   - Get an API key from [Anthropic Console](https://console.anthropic.com/)
   - Create a `.env` file in the root directory
   - Add your API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

## Usage

### Basic Command

```bash
npx ts-node src/index.ts learn "<topic>"
```

### Examples

Learn Angular services (default: easy, 5 questions):
```bash
npx ts-node src/index.ts learn "Angular services"
```

Medium difficulty with 10 questions:
```bash
npx ts-node src/index.ts learn "JavaScript async/await" -d medium -r 10
```

Kid-friendly mode for young learners:
```bash
npx ts-node src/index.ts learn "Solar System" --mode kid -r 8
```

Hard difficulty challenge:
```bash
npx ts-node src/index.ts learn "TypeScript generics" -d hard
```

### Command Options

- `<topic>` - **Required**: The topic you want to learn about
- `-d, --difficulty <level>` - Difficulty level: `easy`, `medium`, or `hard` (default: easy)
- `-r, --rounds <number>` - Number of questions (1-20, default: 5)
- `--mode <mode>` - Quiz mode: `standard` or `kid` (default: standard)

## Features in Detail

### Adaptive Learning

Questions are progressively generated to increase in difficulty within each quiz session, helping you build understanding step by step.

### Score-Based Follow-ups

If you score below 80%, QuizQuest will offer you a deeper quiz on challenging concepts to reinforce your learning.

### Quiz History

All quiz sessions are automatically saved to `quiz-history.json`, allowing you to track your learning progress over time.

### Fallback Questions

Even without an API key, QuizQuest provides fallback questions so you can try the application.

## Project Structure

```
ai-quiz-quest/
├── src/
│   └── index.ts          # Main application
├── .env                   # API configuration (create this)
├── quiz-history.json      # Quiz history (auto-generated)
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── README.md              # Documentation
```

## Development

Run in development mode:
```bash
npm run dev learn "Your Topic"
```

Build the project:
```bash
npm run build
```

## Dependencies

- **@anthropic-ai/sdk** - Claude AI integration
- **commander** - CLI command parsing
- **inquirer** - Interactive prompts
- **chalk** - Terminal styling
- **dotenv** - Environment configuration
- **TypeScript** - Type safety

## Error Handling

QuizQuest handles errors gracefully:
- Missing API key: Falls back to sample questions
- API failures: Automatic fallback questions
- Invalid options: Clear error messages
- Network issues: User-friendly error reporting

## Examples of Use Cases

- **Students**: Learn new subjects interactively
- **Developers**: Test knowledge on programming topics
- **Teachers**: Generate quick quizzes for students
- **Parents**: Educational quizzes for children (kid mode)
- **Self-learners**: Reinforce understanding of any topic

## Contributing

Contributions welcome! Areas for enhancement:
- Additional quiz modes
- Statistics dashboard
- Multiplayer support
- Question difficulty rating
- Custom question banks

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Happy Learning with QuizQuest!** 🎓✨
