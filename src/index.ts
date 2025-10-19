#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import * as dotenv from 'dotenv';
import inquirer from 'inquirer';
import { QuizQuestion, QuizState, QuizMode, QuestionFormat, ContentSource } from './shared/types.js';
import { generateQuestions, generateTopicFromContent } from './shared/quiz.js';
import { readFileContent, saveQuizHistory } from './shared/file-utils.js';

// Load environment variables
dotenv.config();

// Content Fetcher Functions

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

// Run Interactive Quiz
async function runQuiz(questions: QuizQuestion[], format: QuestionFormat): Promise<number> {
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

    // Display choices based on format
    const choices = format === 'true-false'
      ? q.options  // For true/false, just show "True" and "False"
      : q.options.map((opt, idx) => {
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
      console.log(chalk.bold.red('\n✗ Incorrect'));
      if (format === 'true-false') {
        console.log(chalk.yellow(`The correct answer was: ${q.options[q.correct]}`));
      } else {
        const correctLetter = String.fromCharCode(65 + q.correct);
        console.log(chalk.yellow(`The correct answer was: ${correctLetter}. ${q.options[q.correct]}`));
      }
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
  .option('--format <type>', 'Question format: multiple-choice or true-false', 'multiple-choice')
  .option('-s, --source <type>', 'Content source: topic, web, file, or url', 'topic')
  .option('-f, --file <path>', 'Path to file (when using --source file)')
  .option('-u, --url <url>', 'URL to scrape (when using --source url)')
  .action(async (topic: string | undefined, options: { difficulty: string; rounds: string; mode: string; format: string; source: string; file?: string; url?: string }) => {
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

      const format = options.format.toLowerCase() as QuestionFormat;
      if (!['multiple-choice', 'true-false'].includes(format)) {
        console.log(chalk.red('❌ Invalid format. Use: multiple-choice or true-false'));
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
          topic = await generateTopicFromContent(content, apiKey);
          console.log(chalk.green(`✓ Topic identified: "${topic}"\n`));
        } catch (error) {
          process.exit(1);
        }
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
      console.log(chalk.white(`Format: ${chalk.bold(format)}`));
      console.log(chalk.white(`Source: ${chalk.bold(source)}`));
      if (sourceDetails) {
        console.log(chalk.white(`Details: ${chalk.bold(sourceDetails)}`));
      }
      console.log();

      // Generate questions
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

      let questions: QuizQuestion[];
      try {
        questions = await generateQuestions(topic, difficulty, rounds, mode, format, apiKey, content);
      } catch (error) {
        process.exit(1);
      }

      if (questions.length === 0) {
        console.log(chalk.red('❌ Could not generate questions. Please try again.'));
        process.exit(1);
      }

      // Run quiz
      const score = await runQuiz(questions, format);

      // Initialize quiz state
      const quizState: QuizState = {
        topic,
        difficulty,
        rounds: questions.length,
        score,
        history: [],
        timestamp: new Date().toISOString(),
        source,
        sourceDetails,
        questionFormat: format
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
