/**
 * Test Cases for Vocabulary Duplicate Detection
 *
 * This file contains test scenarios to verify the duplicate detection system
 * works correctly for both single and bulk vocabulary additions.
 */

import { checkVocabularyDuplicate, checkBulkVocabularyDuplicates, getDuplicateStats, filterNonDuplicates } from '../utils/vocabularyDuplicateChecker';
import { Vocabulary } from '../types/vocabulary';

// Mock existing vocabularies in the database
const existingVocabularies: Vocabulary[] = [
    {
        id: '1',
        english: 'run',
        bangla: 'দৌড়ানো',
        partOfSpeech: 'Verb',
        pronunciation: 'rʌn',
        explanation: 'To move at a speed faster than walking',
        examples: [{ en: 'I run every morning', bn: 'আমি প্রতিদিন সকালে দৌড়াই' }],
        synonyms: ['sprint', 'jog'],
        antonyms: ['walk', 'stop'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        userId: 'user1'
    },
    {
        id: '2',
        english: 'walk',
        bangla: 'হাঁটা',
        partOfSpeech: 'Verb',
        pronunciation: 'wɔːk',
        explanation: 'To move at a regular pace by lifting and setting down each foot',
        examples: [{ en: 'I walk to school', bn: 'আমি স্কুলে হাঁটি' }],
        synonyms: ['stroll', 'march'],
        antonyms: ['run', 'stop'],
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
        userId: 'user1'
    },
    {
        id: '3',
        english: 'book',
        bangla: 'বই',
        partOfSpeech: 'Noun',
        pronunciation: 'bʊk',
        explanation: 'A written or printed work consisting of pages',
        examples: [{ en: 'I read a book', bn: 'আমি একটি বই পড়ি' }],
        synonyms: ['volume', 'publication'],
        antonyms: [],
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
        userId: 'user1'
    }
];

// Test Case 1: Exact Duplicate (Should be detected)
console.log('=== Test Case 1: Exact Duplicate ===');
const test1 = checkVocabularyDuplicate(
    { english: 'run', partOfSpeech: 'Verb' },
    existingVocabularies
);
console.log('Input: "run" (Verb)');
console.log('Expected: Duplicate detected');
console.log('Result:', test1.isDuplicate ? '✅ PASS' : '❌ FAIL');
console.log('Message:', test1.message);
console.log('Duplicates found:', test1.duplicates.length);
console.log('');

// Test Case 2: Same Word, Different POS (Should NOT be duplicate)
console.log('=== Test Case 2: Same Word, Different POS ===');
const test2 = checkVocabularyDuplicate(
    { english: 'run', partOfSpeech: 'Noun' },
    existingVocabularies
);
console.log('Input: "run" (Noun)');
console.log('Expected: NOT a duplicate (different POS)');
console.log('Result:', !test2.isDuplicate ? '✅ PASS' : '❌ FAIL');
console.log('Message:', test2.message);
console.log('Same word entries found:', test2.duplicates.length);
console.log('');

// Test Case 3: New Word (Should NOT be duplicate)
console.log('=== Test Case 3: New Word ===');
const test3 = checkVocabularyDuplicate(
    { english: 'jump', partOfSpeech: 'Verb' },
    existingVocabularies
);
console.log('Input: "jump" (Verb)');
console.log('Expected: NOT a duplicate (new word)');
console.log('Result:', !test3.isDuplicate ? '✅ PASS' : '❌ FAIL');
console.log('Message:', test3.message);
console.log('');

// Test Case 4: Case Insensitive (Should be duplicate)
console.log('=== Test Case 4: Case Insensitive ===');
const test4 = checkVocabularyDuplicate(
    { english: 'RUN', partOfSpeech: 'verb' },
    existingVocabularies
);
console.log('Input: "RUN" (verb)');
console.log('Expected: Duplicate detected (case insensitive)');
console.log('Result:', test4.isDuplicate ? '✅ PASS' : '❌ FAIL');
console.log('Message:', test4.message);
console.log('');

// Test Case 5: Bulk Check with Mixed Results
console.log('=== Test Case 5: Bulk Check ===');
const bulkVocabs = [
    { english: 'run', partOfSpeech: 'Verb' },      // Duplicate
    { english: 'walk', partOfSpeech: 'Verb' },     // Duplicate
    { english: 'jump', partOfSpeech: 'Verb' },     // Unique
    { english: 'book', partOfSpeech: 'Verb' },     // Unique (different POS)
    { english: 'swim', partOfSpeech: 'Verb' }      // Unique
];

const bulkResults = checkBulkVocabularyDuplicates(bulkVocabs, existingVocabularies);
const stats = getDuplicateStats(bulkResults);

console.log('Input: 5 vocabularies');
console.log('Expected: 2 duplicates, 3 unique');
console.log('Results:');
console.log('  Total:', stats.total);
console.log('  Duplicates:', stats.duplicates);
console.log('  Unique:', stats.unique);
console.log('  Same word, different POS:', stats.sameWordDifferentPos);
console.log('Result:', stats.duplicates === 2 && stats.unique === 3 ? '✅ PASS' : '❌ FAIL');
console.log('');

// Test Case 6: Filter Non-Duplicates
console.log('=== Test Case 6: Filter Non-Duplicates ===');
const filtered = filterNonDuplicates(bulkVocabs, bulkResults);
console.log('Input: 5 vocabularies (2 duplicates)');
console.log('Expected: 3 unique vocabularies after filtering');
console.log('Result:', filtered.length === 3 ? '✅ PASS' : '❌ FAIL');
console.log('Filtered vocabularies:', filtered.map(v => `${v.english} (${v.partOfSpeech})`).join(', '));
console.log('');

// Test Case 7: Empty Database
console.log('=== Test Case 7: Empty Database ===');
const test7 = checkVocabularyDuplicate(
    { english: 'test', partOfSpeech: 'Noun' },
    []
);
console.log('Input: "test" (Noun) with empty database');
console.log('Expected: NOT a duplicate');
console.log('Result:', !test7.isDuplicate ? '✅ PASS' : '❌ FAIL');
console.log('Message:', test7.message);
console.log('');

// Summary
console.log('=== TEST SUMMARY ===');
console.log('All test cases should show ✅ PASS');
console.log('If any show ❌ FAIL, there is an issue with the duplicate detection logic');
