// Implement default processing
import { Language } from './definitions';

const bulletChar = '\u2022';

export class SentenceSplitter {
  private readonly words: string[];
  private currentWordIndex: number;
  private currentSentence: string[];
  private sentences: string[];
  private abbreviations: string[] = [];
  private dateRegex: RegExp = /\./g;
  private abbreviationRegexes: RegExp[] = [/\./g];
  private readonly language: string;
  private isCreated = false;

  constructor(input: string, language: string) {
    // newlines will get replaced with bullet chars. they may be in the pdf and we don't want that in sentences - and we will use them as special chars
    const replaceNewLinesWithBulletChars = input.replace(/\r\n|\r|\n/g, bulletChar);

    // but if we have a dot and a newline directly next to each other, we don't want that. that would confuse our sentences
    const replaceDotsAndBulletChars = replaceNewLinesWithBulletChars.replace(
      new RegExp(`([.]${bulletChar}|${bulletChar}[.])`, 'g'),
      '. ',
    );

    // but if we have two newlines directly next to each other, we want a newline and a space
    const replaceDoubleNewlines = replaceDotsAndBulletChars.replace(
      new RegExp(`${bulletChar}${bulletChar}`, 'g'),
      `${bulletChar} `,
    );

    this.words = replaceDoubleNewlines.split(/\s+/);
    this.currentWordIndex = 0;
    this.currentSentence = [];
    this.sentences = [];
    this.language = language;
  }

  public async create(): Promise<void> {
    if (this.isCreated) return;
    try {
      const abbreviationData = await import(`./abbreviations/${this.language}.json`);
      this.abbreviations = abbreviationData.abbreviations;
      this.abbreviationRegexes = abbreviationData.abbreviationRegexes.map(
        (regex: string) => new RegExp(regex.slice(1, -1)),
      );
      this.dateRegex = new RegExp(abbreviationData.dateRegex.slice(1, -1));
      this.isCreated = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`No or incorrect abbreviations found for language: ${this.language}`);
      this.abbreviations = [];
      this.abbreviationRegexes = [];
      this.dateRegex = /^(19|20)\d{2}$/;
    }
  }

  public async process(): Promise<string[]> {
    await this.create();
    for (const word of this.words) {
      this.currentSentence.push(word);
      if (this.isSentenceEnd(word)) {
        this.sentences.push(this.currentSentence.join(' '));
        this.currentSentence = [];
      }
      this.currentWordIndex++;
    }
    if (this.currentSentence.length > 0) {
      this.sentences.push(this.currentSentence.join(' '));
    }
    // replace the bullet char again
    const sentencesWithoutBulletChar = this.sentences.map((sentence) =>
      sentence.replace(new RegExp(bulletChar, 'g'), ' '),
    );

    // and remove trailing/leading spaces (again)
    return sentencesWithoutBulletChar.map((s) => s.trim());
  }

  public static supportedLanguages(): string[] {
    return Object.keys(Language);
  }

  private isNumberOrRomanNumeral(word: string): boolean {
    return /^[0-9]+\.?$/.test(word) || /^[IVX]+\.?$/.test(word);
  }

  private isDateExpression(word: string): boolean {
    const currentWord = word;
    const nextWord = this.words[this.currentWordIndex] || '';
    const secondNextWord = this.words[this.currentWordIndex + 1] || '';
    const previousWord = this.currentSentence[this.currentSentence.length - 1] || '';
    const secondPreviousWord = this.currentSentence[this.currentSentence.length - 2] || '';

    return (
      (this.dateRegex.test(currentWord) && this.isMonth(previousWord)) ||
      (this.dateRegex.test(nextWord) && this.isMonth(currentWord)) ||
      (this.dateRegex.test(secondNextWord) && this.isMonth(nextWord) && this.isNumberOrRomanNumeral(currentWord)) ||
      (this.dateRegex.test(currentWord) &&
        this.isNumberOrRomanNumeral(previousWord) &&
        this.isNumberOrRomanNumeral(secondPreviousWord)) ||
      (this.dateRegex.test(nextWord) &&
        this.isNumberOrRomanNumeral(currentWord) &&
        this.isNumberOrRomanNumeral(previousWord)) ||
      (this.dateRegex.test(secondNextWord) &&
        this.isNumberOrRomanNumeral(nextWord) &&
        this.isNumberOrRomanNumeral(currentWord))
    );
  }

  private isMonth(word: string): boolean {
    return this.dateRegex.test(word);
  }

  private isSentenceEnd(word: string): boolean {
    // Special case for numbers (ordinals)
    if (this.isNumberOrRomanNumeral(word)) {
      // if the word is part of a date expression, it is not the end of a sentence,
      // but we know little else
      if (this.isDateExpression(word)) return false;
    }

    if (word.endsWith('!') || word.endsWith('?')) {
      return true;
    }

    // Check for ellipsis (...) special case
    if (word.endsWith('...') || word.endsWith(bulletChar)) {
      // we think it is a line-ending, if the next word is capitalized
      return this.isNextWordCapitalized();
    }

    if (word.endsWith('.')) {
      // Check if it's not an abbreviation, date, or year
      return !(this.isAbbreviation(word) || this.isMonth(word));
    }
    return false;
  }

  private isNextWordCapitalized(): boolean {
    const nextWord = this.words[this.currentWordIndex + 1];
    return !!nextWord && /^[A-ZÄÖÜ]/.test(nextWord);
  }

  private isAbbreviation(word: string): boolean {
    return this.abbreviations.includes(word) || this.abbreviationRegexes.some((regex) => regex.test(word));
  }
}
