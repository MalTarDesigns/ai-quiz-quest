# QuizQuest - AI-Powered Learning Quiz CLI

Interactive command-line quiz application powered by Anthropic's Claude AI. Learn any topic through adaptive, progressively challenging questions with instant feedback and explanations. Generate quizzes from topics or your own documents (TXT, MD, PDF, DOCX).

## Quick Start

Get started in 3 simple steps:

```bash
# 1. Clone or download this repository
# 2. Install dependencies
npm install

# 3. Set up your API key (and optional config)
echo "ANTHROPIC_API_KEY=your_actual_api_key_here" > .env
echo "ANTHROPIC_MODEL=claude-sonnet-4-5-20250929" >> .env
echo "MAX_QUESTIONS=50" >> .env

# 4. Run your first quiz!
npm run dev learn "JavaScript" -d easy -r 5
```

Get your free API key from [Anthropic Console](https://console.anthropic.com/)

## Features

- **AI-Generated Questions**: Dynamic quiz generation using Claude AI
- **Multiple Question Formats**: Choose between multiple-choice (4 options) or true-false questions
- **Multiple Content Sources**: Generate quizzes from topics or your own documents
- **File Upload Support**: Supports TXT, MD, PDF, and DOCX files
- **Adaptive Difficulty**: Choose from easy, medium, or hard difficulty levels
- **Kid-Friendly Mode**: Special mode with fun analogies and simple language
- **Interactive Experience**: Colorful, engaging terminal interface
- **Instant Feedback**: Immediate explanations after each question
- **Progress Tracking**: Automatic saving of quiz history with source tracking
- **Smart Follow-ups**: Offers deeper practice on challenging topics

## Installation

1. Clone or download this repository:
```bash
# If cloning from GitHub
git clone [your-repository-url]
cd ai-quiz-quest

# Or download and extract the ZIP file, then navigate to the folder
```

2. Install dependencies:
```bash
npm install
```

3. Configure your API key:
   - Get an API key from [Anthropic Console](https://console.anthropic.com/)
   - Create a `.env` file in the root directory
   - Add your API key and optional settings:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929
MAX_QUESTIONS=50
```

## Configuration

### Environment Variables

QuizQuest supports the following environment variables in your `.env` file:

- **ANTHROPIC_API_KEY** (required): Your Anthropic API key
- **ANTHROPIC_MODEL** (optional): Claude model to use for quiz generation
  - Supported models:
    - `claude-sonnet-4-5-20250929` (64k output) - Latest & best [DEFAULT]
    - `claude-sonnet-4-20250514` (64k output) - Good for large quizzes
    - `claude-opus-4-20250514` (32k output) - Most capable model
    - `claude-3-7-sonnet-20250219` (8k/128k output) - Extended thinking
    - `claude-haiku-4-5` (8k output) - Fast and efficient
  - Default: `claude-sonnet-4-5-20250929`
  - For 50-100 questions, use models with higher token limits (64k)
- **MAX_QUESTIONS** (optional): Maximum number of questions allowed per quiz
  - Supported values: `50` or `100`
  - Default: `50`
  - Controls the upper limit for the `-r, --rounds` option
  - Higher values increase API costs proportionally (see Cost Analysis below)

### Cost Analysis

QuizQuest uses Claude Sonnet 4.5 API by default with the following approximate costs per quiz:

| Questions | Topic-Based Quiz | File-Based Quiz (50K chars) |
|-----------|------------------|------------------------------|
| 5-20      | $0.02-$0.04      | $0.06-$0.09                  |
| 50        | $0.06-$0.10      | $0.10-$0.15                  |
| 100       | $0.12-$0.18      | $0.16-$0.24                  |

**Note:** Costs vary by model:
- Claude Sonnet 4.5/4: $3/$15 per million tokens (input/output)
- Claude Opus 4: $15/$75 per million tokens (higher quality, higher cost)
- Claude Haiku 4.5: Lower cost, faster responses

All costs remain very affordable, even at maximum question counts.

## Usage

### Basic Command

Development mode:
```bash
npm run dev learn "<topic>" [options]
```

Production mode (after building):
```bash
npm run build
npm start learn "<topic>" [options]
```

### Content Source Options

QuizQuest supports two content sources for generating quizzes:

1. **Topic-based** (default): General knowledge questions on any topic using Claude's knowledge
2. **File-based**: Generate questions from your own documents (TXT, MD, PDF, DOCX)

### Examples

#### Topic-Based Quizzes (Default)

Learn Angular services (default: easy, 5 questions):
```bash
npm run dev learn "Angular services"
```

Medium difficulty with 10 questions:
```bash
npm run dev learn "JavaScript async/await" -d medium -r 10
```

Kid-friendly mode for young learners:
```bash
npm run dev learn "Solar System" --mode kid -r 8
```

Hard difficulty challenge:
```bash
npm run dev learn "TypeScript generics" -d hard
```

Extended quiz with maximum questions (requires MAX_QUESTIONS=50 in .env):
```bash
npm run dev learn "Python Programming" -r 50 -d medium
```

Comprehensive quiz at max capacity (requires MAX_QUESTIONS=100 in .env):
```bash
npm run dev learn "Data Structures" -r 100 -d hard
```

#### File-Based Quizzes

Generate quiz from your study notes:
```bash
npm run dev learn "React Hooks" --source file --file ./my-notes.txt -r 10
```

Quiz from documentation:
```bash
npm run dev learn "API Design" --source file --file /path/to/docs.md -d medium
```

Test knowledge from course materials:
```bash
npm run dev learn "Database Fundamentals" -s file -f ./db-chapter.txt -d hard
```

Quiz from a PDF document:
```bash
npm run dev learn "Machine Learning" -s file -f ./ml-textbook.pdf -r 10
```

Quiz from a Word document:
```bash
npm run dev learn "History Notes" -s file -f ./history-chapter3.docx -d medium
```

#### True/False Format Quizzes

Quick true/false quiz on any topic:
```bash
npm run dev learn "Python basics" --format true-false -r 10
```

True/false quiz for kids:
```bash
npm run dev learn "Animals" --format true-false --mode kid -r 8
```

Hard difficulty true/false challenge:
```bash
npm run dev learn "Quantum Physics" --format true-false -d hard -r 15
```

True/false quiz from a file:
```bash
npm run dev learn "Study Notes" --format true-false -s file -f ./notes.pdf -r 10
```

### Command Options

**Required:**
- `<topic>` - The topic you want to learn about

**Optional:**
- `-d, --difficulty <level>` - Difficulty level: `easy`, `medium`, or `hard` (default: `easy`)
- `-r, --rounds <number>` - Number of questions (1-50 or 1-100 depending on MAX_QUESTIONS config, default: `5`)
- `--mode <mode>` - Quiz mode: `standard` or `kid` (default: `standard`)
- `--format <type>` - Question format: `multiple-choice` or `true-false` (default: `multiple-choice`)
- `-s, --source <type>` - Content source: `topic` or `file` (default: `topic`)
- `-f, --file <path>` - Path to file (required when using `--source file`)

**Note:** The maximum value for `-r, --rounds` is controlled by the `MAX_QUESTIONS` environment variable (default: 50, max: 100).

## Features in Detail

### Content Sources

#### 1. Topic-Based (Default)
Generate quizzes on any topic using Claude's general knowledge. Perfect for learning new concepts or testing existing knowledge.

#### 2. File-Based
Upload your own study materials, notes, or documentation to create targeted quizzes. Supports:
- Text files (.txt)
- Markdown files (.md)
- PDF documents (.pdf) - extracts and parses text content
- Word documents (.docx) - extracts formatted text
- Any UTF-8 text content
- Automatic content truncation (50,000 character limit to prevent token overflow)
- Both relative and absolute file paths

**Use Cases:**
- Study for exams using course notes
- Test understanding of technical documentation (including PDFs)
- Review meeting notes or study guides
- Create quizzes from research papers and academic PDFs
- Quiz from Word documents and presentations

### Adaptive Learning

Questions are progressively generated to increase in difficulty within each quiz session, helping you build understanding step by step.

### Score-Based Follow-ups

If you score below 80%, QuizQuest will offer you a deeper quiz on challenging concepts to reinforce your learning.

### Quiz History

All quiz sessions are automatically saved to `quiz-history.json`, including:
- Topic and difficulty
- Score and timestamp
- Content source type
- Source details (file path, URL, or search query)

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
- **Missing API key**: Clear instructions to configure
- **API failures**: Detailed error messages with troubleshooting steps
- **Invalid options**: Helpful validation messages
- **File errors**: Specific messages for not found, permission denied, or empty files
- **Network issues**: User-friendly error reporting
- **Content validation**: Checks for file existence, URL format, and required options

## Examples of Use Cases

- **Students**: Learn new subjects interactively, create quizzes from class notes
- **Developers**: Test knowledge on programming topics, quiz from documentation
- **Teachers**: Generate quick quizzes for students from course materials
- **Parents**: Educational quizzes for children (kid mode)
- **Self-learners**: Reinforce understanding of any topic using your own study materials
- **Researchers**: Test comprehension of papers and articles
- **Certification Prep**: Create practice tests from study guides

## Roadmap

### Phase 1: Core Features ✅ (Complete)
- Topic-based quiz generation
- Difficulty levels and kid mode
- Quiz history tracking
- Improved error handling

### Phase 2: Content Sources & Formats ✅ (Complete)
- File-based quiz generation with multiple formats (TXT, MD, PDF, DOCX)
- True/false and multiple-choice question formats
- Enhanced quiz history with source tracking
- Adaptive question generation from custom content

### Future Enhancements
See [GitHub Issues](https://github.com/MalTarDesigns/ai-quiz-quest/issues) for planned features:
- Multi-provider AI support (OpenAI, Google Gemini)
- Web search and URL scraping integration
- Statistics dashboard
- Custom question banks
- Spaced repetition learning
- Export quiz results

## Contributing

Contributions welcome! Check out our [GitHub Issues](https://github.com/MalTarDesigns/ai-quiz-quest/issues) for planned enhancements and feature requests. Feel free to:
- Report bugs or request features
- Submit pull requests
- Improve documentation
- Share feedback and ideas

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Happy Learning with QuizQuest!** 🎓✨
