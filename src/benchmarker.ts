/* eslint-disable no-console */
import { promises as fs } from 'fs';
import path from 'node:path';
import { SentenceSplitter } from './sentenceSplitter';

import { Language } from './definitions';
import { processString } from './functions';
import { isEqual } from '@donedeal0/superdiff';
import { getListDiff } from '@donedeal0/superdiff';
const red = '\x1b[31m';
const green = '\x1b[32m';
const reset = '\x1b[0m';

const debug = process.env.debug ?? false;

export class Benchmarker {
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

            if (!isEqual(result, expected) && debug) {
              let textdiff = `Mismatch at ${filePath}:\n`;
              const diff = getListDiff(result, expected);
              diff.diff.forEach((line) => {
                if (line.status === 'added') textdiff += `${green}${JSON.stringify(line.value)}${reset}\n`;
                if (line.status === 'deleted') textdiff += `${red}${JSON.stringify(line.value)}${reset}\n`;
              });
              console.log(`${textdiff}\n----`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing tests for language ${lang}:`, error);
      }
    }

    const accuracy = (correctTests / totalTests) * 100;
    console.log(`Benchmark results: ${accuracy.toFixed(2)}% correct (${correctTests}/${totalTests})`);
    console.log(`Supported languages: ${SentenceSplitter.supportedLanguages()}`);
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
