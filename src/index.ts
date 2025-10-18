#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import * as fs from 'fs/promises';
import * as path from 'path';
import mammoth from 'mammoth';
// @ts-ignore - pdf-parse has type issues with ES modules
import pdfParse from 'pdf-parse';

// Load environment variables
dotenv.config();

// Type Definitions
interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizState {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rounds: number;
  score: number;
  history: string[];
  timestamp: string;
  source: ContentSource;
  sourceDetails?: string;
}

type QuizMode = 'kid' | 'standard';

type ContentSource = 'topic' | 'web' | 'file' | 'url';

// @ts-ignore - interface reserved for future use
interface ContentSourceOptions {
  source: ContentSource;
  file?: string;
  url?: string;
}

// Content Fetcher Functions

async function readFileContent(filePath: string): Promise<string> {
  try {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    const stats = await fs.stat(resolvedPath);
    if (!stats.isFile()) {
      throw new Error('Path is not a file');
    }

    // Detect file type by extension
    const ext = path.extname(resolvedPath).toLowerCase();
    let content: string;

    switch (ext) {
      case '.docx':
        content = await readDocxFile(resolvedPath);
        break;
      case '.pdf':
        content = await readPdfFile(resolvedPath);
        break;
      case '.txt':
      case '.md':
      case '.markdown':
      case '.text':
      default:
        // Plain text files
        content = await fs.readFile(resolvedPath, 'utf-8');
        break;
    }

    if (!content || content.trim().length === 0) {
      throw new Error('File is empty or contains no extractable text');
    }

    // Truncate to prevent token overflow (approximately 50,000 characters)
    const maxLength = 50000;
    if (content.length > maxLength) {
      console.log(chalk.yellow(`⚠️  File content truncated to ${maxLength} characters`));
      return content.substring(0, maxLength);
    }

    return content;

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`File not found: ${filePath}`);
      } else if (error.message.includes('EACCES')) {
        throw new Error(`Permission denied: ${filePath}`);
      }
      throw error;
    }
    throw new Error('Failed to read file');
  }
}

async function readDocxFile(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      console.log(chalk.gray('📝 Document parsing notes:'));
      result.messages.forEach(msg => {
        console.log(chalk.gray(`  - ${msg.message}`));
      });
    }

    return result.value;
  } catch (error) {
    throw new Error(`Failed to parse .docx file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function readPdfFile(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    // @ts-ignore - pdf-parse has type issues with call signature
    const data = await pdfParse(buffer);

    console.log(chalk.gray(`📄 PDF parsed: ${data.numpages} pages, ${data.text.length} characters`));

    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse .pdf file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function fetchWebContent(query: string): Promise<string> {
  // Placeholder for Firecrawl MCP integration
  console.log(chalk.yellow('⚠️  Web search feature coming soon (requires Firecrawl MCP)'));
  console.log(chalk.cyan(`📝 Search query: "${query}"`));
  throw new Error('Web search not yet implemented. Use --source topic, --file, or --url instead.');
}

async function fetchUrlContent(url: string): Promise<string> {
  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    throw new Error(`Invalid URL format: ${url}`);
  }

  // Placeholder for Firecrawl MCP integration
  console.log(chalk.yellow('⚠️  URL scraping feature coming soon (requires Firecrawl MCP)'));
  console.log(chalk.cyan(`📝 URL: "${url}"`));
  throw new Error('URL scraping not yet implemented. Use --source topic or --file instead.');
}

// Generate Questions using Claude API
async function generateTopicFromContent(content: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const prompt = `Analyze the following text and provide a concise topic (3-5 words) that summarizes it. Only return the topic string, with no extra text or quotation marks.\n\nContent:\n${content}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    const topic = message.content[0].type === 'text' ? message.content[0].text.trim() : 'General Knowledge';
    return topic;

  } catch (error) {
    console.log(chalk.red('\n❌ ERROR: Failed to determine topic from file.\n'));
    if (error instanceof Error) {
      console.log(chalk.white(`  ${error.message}`));
    }
    console.log(chalk.yellow('\nPlease check your API key and network connection.\n'));
    process.exit(1);
  }
}

async function generateQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  rounds: number,
  mode: QuizMode,
  content?: string
): Promise<QuizQuestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.log(chalk.bold.red('\n❌ ERROR: Anthropic API key not configured\n'));
    console.log(chalk.yellow('To fix this:'));
    console.log(chalk.white('  1. Create a .env file in the project root'));
    console.log(chalk.white('  2. Add: ANTHROPIC_API_KEY=your-actual-api-key-here'));
    console.log(chalk.white('  3. Get your API key from: https://console.anthropic.com/'));
    console.log(chalk.gray('\nQuiz cannot start without a valid API key.\n'));
    process.exit(1);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const modeInstruction = mode === 'kid'
      ? 'Make the questions kid-friendly with fun analogies and simple language that a child can understand. Use exciting and engaging wording.'
      : 'Use professional, educational language appropriate for adult learners.';

    // When content is provided, restructure prompt to prioritize the content over the topic
    const prompt = content
      ? `You are creating a quiz based EXCLUSIVELY on the following provided content. DO NOT use any external knowledge or information not present in the content below.

CONTENT TO USE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${content}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based ONLY on the information in the content above, generate exactly ${rounds} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

${modeInstruction}

Make the questions progressively more challenging within the set.

CRITICAL REQUIREMENTS:
- All questions MUST be answerable using ONLY the provided content
- Do NOT include information from your general knowledge about "${topic}"
- If the content doesn't have enough information for ${rounds} questions, create fewer questions rather than inventing information
- Every answer and explanation must reference specific details from the provided content

Return ONLY a valid JSON array with this exact structure, no markdown formatting:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed explanation of why the answer is correct"
  }
]

Rules:
- Each question must have exactly 4 options
- The "correct" field is the zero-based index (0-3) of the correct option
- Include educational explanations
- Make questions engaging and thought-provoking
- Ensure factual accuracy by using ONLY the provided content`
      : `Generate exactly ${rounds} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

${modeInstruction}

Make the questions progressively more challenging within the set.

Return ONLY a valid JSON array with this exact structure, no markdown formatting:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed explanation of why the answer is correct"
  }
]

Rules:
- Each question must have exactly 4 options
- The "correct" field is the zero-based index (0-3) of the correct option
- Include educational explanations
- Make questions engaging and thought-provoking
- Ensure factual accuracy`;

    console.log(chalk.cyan('🤖 Generating quiz questions with Claude AI...\n'));

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Strip markdown code blocks if present
    const cleanedResponse = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const questions = JSON.parse(cleanedResponse) as QuizQuestion[];

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('Invalid questions format');
    }

    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
          typeof q.correct !== 'number' || !q.explanation) {
        throw new Error('Invalid question structure');
      }
    }

    return questions;

  } catch (error) {
    console.log(chalk.bold.red('\n❌ ERROR: Failed to generate quiz questions\n'));
    console.log(chalk.yellow('Details:'));
    console.log(chalk.white(`  ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log(chalk.yellow('\nPossible causes:'));
    console.log(chalk.white('  • Network connection issues'));
    console.log(chalk.white('  • Invalid API key'));
    console.log(chalk.white('  • Anthropic API service issues'));
    console.log(chalk.white('  • Rate limiting'));
    console.log(chalk.yellow('\nPlease try again in a moment.\n'));
    process.exit(1);
  }
}

// Run Interactive Quiz
async function runQuiz(questions: QuizQuestion[]): Promise<number> {
  let correctAnswers = 0;
  const totalQuestions = questions.length;

  console.log(chalk.bold.cyan(`\n${'='.repeat(60)}`));
  console.log(chalk.bold.cyan(`🎯 QUIZ TIME! Answer ${totalQuestions} questions`));
  console.log(chalk.bold.cyan(`${'='.repeat(60)}\n`));

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];

    console.log(chalk.bold.blue(`\nQuestion ${i + 1}/${totalQuestions}:`));
    console.log(chalk.white(q.question));
    console.log();

    const choices = q.options.map((opt, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C, D
      return `${letter}. ${opt}`;
    });

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'selection',
        message: chalk.yellow('Your answer:'),
        choices: choices
      }
    ]);

    const selectedIndex = choices.findIndex(c => c === answer.selection);
    const isCorrect = selectedIndex === q.correct;

    if (isCorrect) {
      correctAnswers++;
      console.log(chalk.bold.green('\n✓ Correct! 🎉'));
    } else {
      const correctLetter = String.fromCharCode(65 + q.correct);
      console.log(chalk.bold.red('\n✗ Incorrect'));
      console.log(chalk.yellow(`The correct answer was: ${correctLetter}. ${q.options[q.correct]}`));
    }

    console.log(chalk.cyan(`\n💡 ${q.explanation}`));
    console.log(chalk.gray('\n' + '-'.repeat(60)));
  }

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  console.log(chalk.bold.cyan(`\n${'='.repeat(60)}`));
  console.log(chalk.bold.white(`📊 FINAL SCORE: ${correctAnswers}/${totalQuestions} (${scorePercentage}%)`));
  console.log(chalk.bold.cyan(`${'='.repeat(60)}\n`));

  if (scorePercentage === 100) {
    console.log(chalk.bold.green('🏆 Perfect score! You\'re a master of this topic!\n'));
  } else if (scorePercentage >= 80) {
    console.log(chalk.bold.green('🌟 Great job! You have a strong understanding!\n'));
  } else if (scorePercentage >= 60) {
    console.log(chalk.bold.yellow('👍 Good effort! Some areas need more practice.\n'));
  } else {
    console.log(chalk.bold.red('📚 Keep learning! This topic needs more study.\n'));
  }

  return scorePercentage;
}

// Save Quiz History
async function saveQuizHistory(state: QuizState): Promise<void> {
  const historyPath = path.join(process.cwd(), 'quiz-history.json');

  try {
    let history: QuizState[] = [];

    try {
      const existingData = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(existingData);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }

    history.push(state);

    await fs.writeFile(historyPath, JSON.stringify(history, null, 2), 'utf-8');
    console.log(chalk.gray(`📁 Quiz history saved to ${historyPath}\n`));
  } catch (error) {
    console.log(chalk.red('⚠️  Could not save quiz history:', error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Load Quiz History (available for future features)
// @ts-ignore - function reserved for future use
async function loadQuizHistory(): Promise<QuizState[]> {
  const historyPath = path.join(process.cwd(), 'quiz-history.json');

  try {
    const data = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Main CLI Program
const program = new Command();

program
  .name('quizquest')
  .description('Interactive CLI quiz app powered by Claude AI')
  .version('1.0.0');

program
  .command('learn')
  .description('Start a learning quiz on any topic')
  .argument('[topic]', 'Topic to learn about (optional if file is provided)')
  .option('-d, --difficulty <level>', 'Difficulty level: easy, medium, or hard', 'easy')
  .option('-r, --rounds <number>', 'Number of questions', '5')
  .option('--mode <mode>', 'Quiz mode: standard or kid', 'standard')
  .option('-s, --source <type>', 'Content source: topic, web, file, or url', 'topic')
  .option('-f, --file <path>', 'Path to file (when using --source file)')
  .option('-u, --url <url>', 'URL to scrape (when using --source url)')
  .action(async (topic: string | undefined, options: { difficulty: string; rounds: string; mode: string; source: string; file?: string; url?: string }) => {
    try {
      // Validate options
      const difficulty = options.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        console.log(chalk.red('❌ Invalid difficulty. Use: easy, medium, or hard'));
        process.exit(1);
      }

      const rounds = parseInt(options.rounds, 10);
      if (isNaN(rounds) || rounds < 1 || rounds > 20) {
        console.log(chalk.red('❌ Invalid rounds. Use a number between 1 and 20'));
        process.exit(1);
      }

      const mode = options.mode.toLowerCase() as QuizMode;
      if (!['kid', 'standard'].includes(mode)) {
        console.log(chalk.red('❌ Invalid mode. Use: standard or kid'));
        process.exit(1);
      }

      let source = options.source.toLowerCase() as ContentSource;
      if (options.file) {
        source = 'file';
      }
      if (!['topic', 'web', 'file', 'url'].includes(source)) {
        console.log(chalk.red('❌ Invalid source. Use: topic, web, file, or url'));
        process.exit(1);
      }

      // Validate source-specific options
      if (source === 'file' && !options.file) {
        console.log(chalk.red('❌ --file option required when using --source file'));
        process.exit(1);
      }

      if (source === 'url' && !options.url) {
        console.log(chalk.red('❌ --url option required when using --source url'));
        process.exit(1);
      }

      // Fetch content based on source
      let content: string | undefined;
      let sourceDetails: string | undefined;

      try {
        if (source === 'file' && options.file) {
          console.log(chalk.cyan(`📄 Reading content from file: ${options.file}\n`));
          content = await readFileContent(options.file);
          sourceDetails = options.file;
          console.log(chalk.green(`✓ File loaded successfully (${content.length} characters)\n`));
        } else if (source === 'web') {
          if (!topic) {
            console.log(chalk.red('❌ Topic is required for web search'));
            process.exit(1);
          }
          console.log(chalk.cyan(`🌐 Searching web for: ${topic}\n`));
          content = await fetchWebContent(topic);
          sourceDetails = topic;
        } else if (source === 'url' && options.url) {
          console.log(chalk.cyan(`🔗 Fetching content from URL: ${options.url}\n`));
          content = await fetchUrlContent(options.url);
          sourceDetails = options.url;
        }
      } catch (error) {
        console.log(chalk.red('\n❌ Failed to fetch content:'));
        console.log(chalk.white(`  ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }

      // Determine topic from content if not provided
      if (!topic && content) {
        console.log(chalk.cyan('🤖 Analyzing document to determine the topic...'));
        topic = await generateTopicFromContent(content);
        console.log(chalk.green(`✓ Topic identified: "${topic}"\n`));
      } else if (!topic) {
        console.log(chalk.red('❌ A topic is required if no content source is provided.'));
        program.help();
        process.exit(1);
      }

      // Welcome message
      console.log(chalk.bold.magenta('\n🎓 Welcome to QuizQuest! 🎓'));
      console.log(chalk.white(`Topic: ${chalk.bold(topic)}`));
      console.log(chalk.white(`Difficulty: ${chalk.bold(difficulty)}`));
      console.log(chalk.white(`Questions: ${chalk.bold(rounds)}`));
      console.log(chalk.white(`Mode: ${chalk.bold(mode)}`));
      console.log(chalk.white(`Source: ${chalk.bold(source)}`));
      if (sourceDetails) {
        console.log(chalk.white(`Details: ${chalk.bold(sourceDetails)}`));
      }
      console.log();

      // Generate questions
      const questions = await generateQuestions(topic, difficulty, rounds, mode, content);

      if (questions.length === 0) {
        console.log(chalk.red('❌ Could not generate questions. Please try again.'));
        process.exit(1);
      }

      // Run quiz
      const score = await runQuiz(questions);

      // Initialize quiz state
      const quizState: QuizState = {
        topic,
        difficulty,
        rounds: questions.length,
        score,
        history: [],
        timestamp: new Date().toISOString(),
        source,
        sourceDetails
      };

      // Handle low score - offer deeper quiz
      if (score < 80) {
        const followUp = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continueQuiz',
            message: chalk.yellow('Would you like a deeper quiz on challenging concepts?'),
            default: true
          }
        ]);

        if (followUp.continueQuiz) {
          quizState.history.push(topic);
          console.log(chalk.cyan('\n📝 This topic has been marked for additional practice.'));
          console.log(chalk.cyan('Run the quiz again to reinforce your learning!\n'));
        }
      }

      // Save quiz history
      await saveQuizHistory(quizState);

      console.log(chalk.bold.green('✨ Thank you for using QuizQuest! Keep learning! ✨\n'));

    } catch (error) {
      console.log(chalk.red('\n❌ An error occurred:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);
