import * as fs from 'fs/promises';
import * as path from 'path';
import mammoth from 'mammoth';
import chalk from 'chalk';
import { QuizState } from './types.js';

// @ts-ignore - pdf-parse has type issues with ES modules
import * as pdfParseModule from 'pdf-parse';
// @ts-ignore
const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export async function readFileContent(filePath: string): Promise<string> {
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

export async function readDocxFile(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages.length > 0) {
      console.log(chalk.gray('📝 Document parsing notes:'));
      result.messages.forEach((msg: any) => {
        console.log(chalk.gray(`  - ${msg.message}`));
      });
    }

    return result.value;
  } catch (error) {
    throw new Error(`Failed to parse .docx file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function readPdfFile(filePath: string): Promise<string> {
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

export async function saveQuizHistory(state: QuizState): Promise<void> {
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

export async function loadQuizHistory(): Promise<QuizState[]> {
  const historyPath = path.join(process.cwd(), 'quiz-history.json');

  try {
    const data = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
