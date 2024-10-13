import SentenceSplitter from './sentenceSplitter';
import { Language } from './definitions';

/**
 * Processes a large string based on the specified language.
 * @param inputString The large string to process.
 * @param language The language to use for processing (ISO 639-1 code).
 * @returns The processed string.
 */
export default async function processString(inputString: string, language?: Language): Promise<string[]> {
  // Use default settings if no language is provided
  const selectedLanguage = language || Language.EN;
  if (!Object.values(Language).includes(selectedLanguage as Language)) {
    throw new Error(`Language [${selectedLanguage}] not found`);
  }

  const processor = new SentenceSplitter(inputString, selectedLanguage);
  await processor.create();
  return processor.process();
}
