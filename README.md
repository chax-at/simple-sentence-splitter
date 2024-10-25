# @chax-npm/simple-sentence-splitter

## Code
Find the code in the internal gitea and on github.

# SentenceSplitter Package
## Overview
The SentenceSplitter class is a sophisticated tool designed for splitting text input into individual sentences. It's particularly valuable for natural language processing (NLP) tasks that require sentence-level analysis.

Usage:
```
      import { SentenceSplitter } from '@chax-at/simple-sentence-splitter';
      const sentenceSplitter = new SentenceSplitter(text, language);
      await sentenceSplitter.create();
      return sentenceSplitter.process();
```
## Key Features
1. Text Preprocessing
   Accepts input string and language parameter
   Splits input into words
   Initializes data structures for tracking words, sentences, and overall sentence collection
2. Language-Specific Handling
   Loads language-specific abbreviation data from JSON files
   Includes common abbreviations, regex patterns, and date formats
   Falls back to default values if language file is not found
3. Sentence Boundary Detection
   Identifies sentence boundaries considering:
   Standard punctuation (periods, exclamation marks, question marks)
   Ellipsis (...) followed by capitalized words
   Numbers, Roman numerals, and date expressions
   Abbreviations to avoid false sentence breaks
4. Abbreviation and Date Handling
   Implements methods to identify abbreviations and date expressions
   Prevents incorrect sentence splits in cases like "Mr. Smith" or "Oct. 21, 2023"
5. Flexible Processing
   Iterates through each word, constructing sentences
   Splits sentences based on determined boundaries
   Handles cases where text doesn't end with typical sentence-ending punctuation
   Conclusion
   This package offers a robust solution for sentence splitting, adaptable to different languages and capable of handling various edge cases in text processing. It's an invaluable tool for applications in text analysis, machine translation, or any NLP task requiring sentence-level granularity.
