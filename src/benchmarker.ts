import { promises as fs } from 'fs';
import path from 'node:path';

import { Language } from './definitions';
import processString from './index';

const debug = process.env.debug ?? false;

export default class Benchmarker {
  public async benchmark(): Promise<number> {
    const testFolder = './src/testdata';
    let totalTests = 0;
    let correctTests = 0;

    // Iterate over all languages
    for (const lang of Object.values(Language)) {
      const langFolder = path.join(testFolder, lang);
      try {
        // Check if the language folder exists
        const folderExists = await this.checkFolderExists(langFolder);
        if (!folderExists) {
          console.error(`folder ${langFolder} not found`);
          continue;
        }

        // Read all files in the language folder
        const files = await fs.readdir(langFolder);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(langFolder, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const { input, expected } = JSON.parse(content);

            const result = await processString(input, lang as Language);

            const wrongSentences = result.filter((sentence) => !expected.includes(sentence));
            totalTests += expected.length;
            correctTests += expected.length - wrongSentences.length;

            if (JSON.stringify(result) !== JSON.stringify(expected) && debug) {
              console.log(` Mismatch`);

              // Create a new array without the matched sentences
              const remainingExpected = expected.filter((exp: string) => !result.includes(exp));

              if (wrongSentences.length > 0) {
                console.log(`########### Wrong sentences in file: ${filePath}:`);
                wrongSentences.forEach((sentence: string) => {
                  console.log(sentence);
                });
                wrongSentences.forEach((sentence: string) => {
                  const closestMatch = this.findClosestMatch(sentence, remainingExpected);
                  console.log(`Actual:   "${sentence}"`);
                  console.log(`Closest:  "${closestMatch}"`);
                  console.log(
                    `Diff:     "${sentence
                      .split('')
                      .map((char: string, i: number) => (char !== closestMatch[i] ? char : ' '))
                      .join('')}"`,
                  );
                  console.log('[Matched by starting word] ---\n');
                });

                const missingSentences = expected.filter((sentence: string) => !result.includes(sentence));
                if (missingSentences.length > 0) {
                  console.log(`########### Missing sentences in file: ${filePath}:`);
                  missingSentences.forEach((sentence: string) => {
                    console.log(sentence);
                  });
                  console.log('---');

                  // Create a new array without the matched sentences
                  const remainingResult = result.filter((exp) => !expected.includes(exp));

                  missingSentences.forEach((sentence: string) => {
                    const closestMatch = this.findClosestMatch(sentence, remainingResult);
                    console.log(`Expected: "${sentence}"`);
                    console.log(`Closest:  "${closestMatch}"`);
                    console.log(
                      `Diff:     "${sentence
                        .split('')
                        .map((char: string, i: number) => (char !== closestMatch[i] ? char : ' '))
                        .join('')}"`,
                    );
                    console.log('[Matched by starting word] ---\n');
                  });
                }
                console.log('---');
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing tests for language ${lang}:`, error);
      }
    }

    const accuracy = (correctTests / totalTests) * 100;
    console.log(`Benchmark results: ${accuracy.toFixed(2)}% correct (${correctTests}/${totalTests})`);
    return accuracy;
  }

  private async checkFolderExists(langFolder: string): Promise<boolean> {
    return fs
      .access(langFolder)
      .then(() => true)
      .catch(() => false);
  }

  findClosestMatch = (sentence: string, haystack: string[]): string => {
    const firstWord = sentence.split(' ')[0];
    return (
      haystack.find((res) => res.startsWith(firstWord)) ||
      haystack.reduce((closest, res) =>
        Math.abs(res.length - sentence.length) < Math.abs(closest.length - sentence.length) ? res : closest,
      )
    );
  };
}
