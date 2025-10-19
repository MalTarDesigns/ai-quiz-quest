import Anthropic from '@anthropic-ai/sdk';
import chalk from 'chalk';
import { QuizQuestion, QuizMode, QuestionFormat } from './types.js';

export async function generateQuestions(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  rounds: number,
  mode: QuizMode,
  format: QuestionFormat,
  apiKey: string,
  content?: string
): Promise<QuizQuestion[]> {
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const modeInstruction = mode === 'kid'
      ? 'Make the questions kid-friendly with fun analogies and simple language that a child can understand. Use exciting and engaging wording.'
      : 'Use professional, educational language appropriate for adult learners.';

    const formatInstruction = format === 'true-false'
      ? {
          type: 'true/false statements',
          optionCount: 2,
          optionExample: '["True", "False"]',
          correctRange: '0-1',
          optionRequirement: 'Each question must have exactly 2 options: "True" and "False"',
          questionStyle: 'Create statements that can be answered as either true or false'
        }
      : {
          type: 'multiple-choice questions',
          optionCount: 4,
          optionExample: '["Option A", "Option B", "Option C", "Option D"]',
          correctRange: '0-3',
          optionRequirement: 'Each question must have exactly 4 options',
          questionStyle: 'Create questions with four distinct answer choices'
        };

    // When content is provided, restructure prompt to prioritize the content over the topic
    const prompt = content
      ? `You are creating a quiz based EXCLUSIVELY on the following provided content. DO NOT use any external knowledge or information not present in the content below.

CONTENT TO USE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${content}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based ONLY on the information in the content above, generate exactly ${rounds} ${formatInstruction.type} about "${topic}" at ${difficulty} difficulty level.

${modeInstruction}

${formatInstruction.questionStyle}

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
    "options": ${formatInstruction.optionExample},
    "correct": 0,
    "explanation": "Detailed explanation of why the answer is correct"
  }
]

Rules:
- ${formatInstruction.optionRequirement}
- The "correct" field is the zero-based index (${formatInstruction.correctRange}) of the correct option
- Include educational explanations
- Make questions engaging and thought-provoking
- Ensure factual accuracy by using ONLY the provided content`
      : `Generate exactly ${rounds} ${formatInstruction.type} about "${topic}" at ${difficulty} difficulty level.

${modeInstruction}

${formatInstruction.questionStyle}

Make the questions progressively more challenging within the set.

Return ONLY a valid JSON array with this exact structure, no markdown formatting:
[
  {
    "question": "Question text here?",
    "options": ${formatInstruction.optionExample},
    "correct": 0,
    "explanation": "Detailed explanation of why the answer is correct"
  }
]

Rules:
- ${formatInstruction.optionRequirement}
- The "correct" field is the zero-based index (${formatInstruction.correctRange}) of the correct option
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

    const expectedOptionCount = format === 'true-false' ? 2 : 4;
    const maxCorrectIndex = format === 'true-false' ? 1 : 3;

    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== expectedOptionCount ||
          typeof q.correct !== 'number' || q.correct < 0 || q.correct > maxCorrectIndex || !q.explanation) {
        throw new Error(`Invalid question structure (expected ${expectedOptionCount} options, correct index 0-${maxCorrectIndex})`);
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
    throw error;
  }
}

export async function generateTopicFromContent(content: string, apiKey: string): Promise<string> {
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
    throw error;
  }
}
