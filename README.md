# QuizQuest - AI-Powered Learning Quiz CLI

Interactive command-line quiz application powered by Anthropic's Claude AI. Learn any topic through adaptive, progressively challenging questions with instant feedback and explanations. Generate quizzes from topics, web searches, uploaded documents, or specific URLs.

## Quick Start

Get started in 3 simple steps:

```bash
# 1. Clone or download this repository
# 2. Install dependencies
npm install

# 3. Set up your API key
echo "ANTHROPIC_API_KEY=your_actual_api_key_here" > .env

# 4. Run your first quiz!
npm run dev learn "JavaScript" -d easy -r 5
```

Get your free API key from [Anthropic Console](https://console.anthropic.com/)

## Features

- **AI-Generated Questions**: Dynamic quiz generation using Claude AI
- **Multiple Question Formats**: Choose between multiple-choice (4 options) or true-false questions
- **Multiple Content Sources**: Generate quizzes from topics, files, web searches, or URLs
- **File Upload Support**: Create quizzes from your documents - supports TXT, MD, PDF, and DOCX files
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
   - Add your API key:
```
ANTHROPIC_API_KEY=your_actual_api_key_here
```

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

QuizQuest supports four content sources for generating quizzes:

1. **Topic-based** (default): General knowledge questions on any topic
2. **File-based**: Generate questions from your own documents
3. **Web search**: Create quizzes from web search results (coming soon)
4. **URL-based**: Generate questions from specific web pages (coming soon)

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

#### Web and URL-Based Quizzes (Coming Soon)

Search web and generate quiz:
```bash
npm run dev learn "Machine Learning" --source web -r 10
```

Quiz from specific URL:
```bash
npm run dev learn "React Documentation" --source url --url https://react.dev/learn
```

### Command Options

**Required:**
- `<topic>` - The topic you want to learn about (or description when using file/url sources)

**Optional:**
- `-d, --difficulty <level>` - Difficulty level: `easy`, `medium`, or `hard` (default: `easy`)
- `-r, --rounds <number>` - Number of questions (1-20, default: `5`)
- `--mode <mode>` - Quiz mode: `standard` or `kid` (default: `standard`)
- `--format <type>` - Question format: `multiple-choice` or `true-false` (default: `multiple-choice`)
- `-s, --source <type>` - Content source: `topic`, `web`, `file`, or `url` (default: `topic`)
- `-f, --file <path>` - Path to file (required when using `--source file`)
- `-u, --url <url>` - URL to scrape (required when using `--source url`)

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

#### 3. Web Search (Coming Soon - Requires Firecrawl MCP)
Search the web and generate quizzes from aggregated search results. Perfect for current events or specialized topics.

#### 4. URL-Based (Coming Soon - Requires Firecrawl MCP)
Generate quizzes from specific web pages, blog posts, or online documentation.

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

### Phase 3: Web Integration (In Progress)
- Web search integration (Pending - requires Firecrawl MCP)
- URL scraping (Pending - requires Firecrawl MCP)
- Firecrawl MCP integration for web/URL sources

### Phase 4: Advanced Features (Planned)
- Statistics dashboard
- Custom question banks
- Spaced repetition learning
- Export quiz results

## Contributing

Contributions welcome! Areas for enhancement:
- Web search and URL scraping integration (Firecrawl MCP)
- Statistics dashboard
- Multiplayer support
- Question difficulty rating
- Additional file format support (CSV, JSON, etc.)
- Custom themes and styling
- Quiz templates and presets

## License

MIT

## Support

For issues or questions, please open an issue in the repository.

---

**Happy Learning with QuizQuest!** 🎓✨
