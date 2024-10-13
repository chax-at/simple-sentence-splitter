// Implement default processing
export default class SentenceSplitter {
  private words: string[];
  private currentWordIndex: number;
  private currentSentence: string[];
  private sentences: string[];
  private abbreviations: string[];
  private dateRegex: RegExp;
  private abbreviationRegexes: RegExp[];

  constructor(input: string, language: string) {
    this.words = input.split(/\s+/);
    this.currentWordIndex = 0;
    this.currentSentence = [];
    this.sentences = [];

    try {
      const abbreviationData = require(`./abbreviations/${language}.json`);
      this.abbreviations = abbreviationData.abbreviations;
      this.abbreviationRegexes = abbreviationData.abbreviationRegexes.map((regex) => new RegExp(regex.slice(1, -1)));
      this.dateRegex = new RegExp(abbreviationData.dateRegex.slice(1, -1));
    } catch (error) {
      console.warn(`No or incorrect abbreviations found for language: ${language}`);
      this.abbreviations = [];
      this.abbreviationRegexes = [];
      this.dateRegex = /^(19|20)\d{2}$/;
    }
  }

  process(): string[] {
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
    return this.sentences;
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
      // if the word is part of a date expression, it is not the end of a sentence
      // but we know little else
      if (this.isDateExpression(word)) return false;
    }

    if (word.endsWith('!') || word.endsWith('?')) {
      return true;
    }

    // Check for ellipsis (...) special case
    if (word.endsWith('...')) {
      // we think it is a line-ending, if the next word is capitalized
      return this.isNextWordCapitalized(word);
    }

    if (word.endsWith('.')) {
      // Check if it's not an abbreviation, date, or year
      return !(this.isAbbreviation(word) || this.isMonth(word));
    }
    return false;
  }

  private isNextWordCapitalized(word: string): boolean {
    const nextWord = this.words[this.currentWordIndex + 1];
    return !!nextWord && /^[A-ZÄÖÜ]/.test(nextWord);
  }

  private isAbbreviation(word: string): boolean {
    return this.abbreviations.includes(word) || this.abbreviationRegexes.some((regex) => regex.test(word));
  }
}
