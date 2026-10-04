import type { Word, TxtParseResult, ParseError, DelimiterType } from '../types/voca';
import { formatTimestamp } from './dateFormatter';

/**
 * Detects the most probable delimiter used in a text string
 */
export function detectDelimiter(text: string): string {
  const sampleLines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'))
    .slice(0, 15);

  if (sampleLines.length === 0) return ':';

  const counts: Record<string, number> = {
    ':': 0,
    '\t': 0,
    '=': 0,
    '->': 0,
    '-': 0,
    '|': 0,
    ',': 0,
  };

  for (const line of sampleLines) {
    if (line.includes('->')) counts['->']++;
    else if (line.includes('\t')) counts['\t']++;
    else if (line.includes(':')) counts[':']++;
    else if (line.includes('=')) counts['=']++;
    else if (line.includes('|')) counts['|']++;
    else if (line.includes('-')) counts['-']++;
    else if (line.includes(',')) counts[',']++;
  }

  let maxDelimiter = ':';
  let maxCount = -1;

  for (const [delim, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxDelimiter = delim;
    }
  }

  return maxCount > 0 ? maxDelimiter : ':';
}

/**
 * Parses raw text content into partial Word objects
 */
export function parseTxtContent(
  text: string,
  delimiterType: DelimiterType = 'auto'
): TxtParseResult {
  let activeDelimiter = ':';

  if (delimiterType === 'auto') {
    activeDelimiter = detectDelimiter(text);
  } else {
    const map: Record<DelimiterType, string> = {
      auto: ':',
      colon: ':',
      tab: '\t',
      comma: ',',
      equal: '=',
      hyphen: '-',
      pipe: '|',
    };
    activeDelimiter = map[delimiterType] || ':';
  }

  const lines = text.split(/\r?\n/);
  const parsedWords: Partial<Word>[] = [];
  const errors: ParseError[] = [];

  const now = formatTimestamp();

  lines.forEach((rawLine, index) => {
    const lineNum = index + 1;
    const line = rawLine.trim();

    // Skip empty lines or comments
    if (!line || line.startsWith('#') || line.startsWith('//')) {
      return;
    }

    let parts: string[] = [];

    if (activeDelimiter === '->') {
      parts = line.split('->');
    } else if (activeDelimiter === '\t') {
      parts = line.split('\t');
    } else {
      // Split by chosen delimiter
      parts = line.split(activeDelimiter);
    }

    // Clean up parts
    parts = parts.map(p => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length < 2) {
      errors.push({
        line: lineNum,
        rawText: rawLine,
        reason: `구분자('${activeDelimiter}')를 찾을 수 없거나 뜻이 분리되지 않았습니다.`,
      });
      return;
    }

    const wordText = parts[0];
    let posText = '';
    let meaningText = '';
    let exampleText = '';
    let exampleMeaningText = '';

    if (parts.length === 2) {
      // Format: word : meaning
      meaningText = parts[1];
    } else if (parts.length === 3) {
      // Format: word : pos : meaning  OR  word : meaning : example
      const second = parts[1].toLowerCase();
      if (
        /^(n|v|adj|adv|prep|conj|pron|n\.|v\.|adj\.|adv\.|명사|동사|형용사|부사)$/.test(
          second
        )
      ) {
        posText = parts[1];
        meaningText = parts[2];
      } else {
        meaningText = parts[1];
        exampleText = parts[2];
      }
    } else if (parts.length >= 4) {
      // Format: word : pos : meaning : example (: exampleMeaning)
      posText = parts[1];
      meaningText = parts[2];
      exampleText = parts[3];
      if (parts.length >= 5) {
        exampleMeaningText = parts[4];
      }
    }

    if (!wordText || !meaningText) {
      errors.push({
        line: lineNum,
        rawText: rawLine,
        reason: '영단어 또는 뜻이 비어있습니다.',
      });
      return;
    }

    parsedWords.push({
      id: `word_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      word: wordText,
      pos: posText || undefined,
      meaning: meaningText,
      example: exampleText || undefined,
      exampleMeaning: exampleMeaningText || undefined,
      createdAt: now,
      updatedAt: now,
      mastered: false,
      starred: false,
      wrongCount: 0,
      correctCount: 0,
    });
  });

  return {
    parsedWords,
    validCount: parsedWords.length,
    errorCount: errors.length,
    errors,
    detectedDelimiter: activeDelimiter,
  };
}

/**
 * Converts words array back to exportable TXT format
 */
export function exportWordsToTxt(words: Word[], delimiter: string = ' : '): string {
  return words
    .map(w => {
      const parts = [w.word];
      if (w.pos) parts.push(w.pos);
      parts.push(w.meaning);
      if (w.example) parts.push(w.example);
      return parts.join(delimiter);
    })
    .join('\n');
}

/**
 * Converts words array to CSV format
 */
export function exportWordsToCsv(words: Word[]): string {
  const headers = ['Word', 'Part of Speech', 'Korean Meaning', 'Example', 'Created At'];
  const rows = words.map(w => [
    `"${(w.word || '').replace(/"/g, '""')}"`,
    `"${(w.pos || '').replace(/"/g, '""')}"`,
    `"${(w.meaning || '').replace(/"/g, '""')}"`,
    `"${(w.example || '').replace(/"/g, '""')}"`,
    `"${w.createdAt}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
