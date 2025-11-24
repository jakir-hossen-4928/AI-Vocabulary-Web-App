# Part of Speech Update - Added "Phrase"

## Changes Made

### 1. **AddVocabulary.tsx** (Word Add Form)
- Added "Phrase" to the `PARTS_OF_SPEECH` array
- Now appears in the dropdown when adding/editing vocabulary words

### 2. **Vocabularies.tsx** (Filter Options)
- Added "Phrase" as a filter option in the Part of Speech filter
- Users can now filter vocabulary list to show only phrases

### 3. **vocabulary.ts** (Type Definition)
- Added "phrase" to the `PartOfSpeech` type union
- Ensures type safety across the application

## Usage

### Adding a Phrase
1. Go to "Add Vocabulary" page
2. Select "Phrase" from the Part of Speech dropdown
3. Fill in the other fields as normal
4. Save

### Filtering by Phrase
1. Go to Vocabularies page
2. Click the Filter button
3. Under "Part of Speech", select "Phrase"
4. Click "Show Results"

### Bulk Upload with Phrases
When using bulk upload, you can now use:
```json
{
  "english": "break the ice",
  "bangla": "বরফ ভাঙা (কথা শুরু করা)",
  "partOfSpeech": "Phrase",
  ...
}
```

Or in CSV:
```csv
"break the ice","বরফ ভাঙা","Phrase",...
```

## Complete List of Parts of Speech
1. Noun
2. Pronoun
3. Verb
4. Adjective
5. Adverb
6. Preposition
7. Conjunction
8. Interjection
9. Phrase
10. Idiom
11. Phrasal Verb
12. Collocation
13. **Linking Phrase** ✨ (NEW)

## Benefits
- Better categorization for multi-word expressions
- Easier to find and filter phrases, idioms, phrasal verbs, collocations, and linking phrases
- More accurate vocabulary organization
- Supports idioms, collocations, phrasal verbs, linking phrases, and common expressions

## Examples

### Phrase
- "by the way" - পাশাপাশি
- "in other words" - অন্য কথায়

### Idiom
- "break the ice" - বরফ ভাঙা (কথা শুরু করা)
- "piece of cake" - খুব সহজ
- "hit the nail on the head" - ঠিক কথা বলা

### Phrasal Verb
- "look forward to" - অপেক্ষা করা
- "get along with" - সাথে মিলেমিশে থাকা
- "give up" - ছেড়ে দেওয়া
- "put off" - স্থগিত করা

### Collocation
- "make a decision" - সিদ্ধান্ত নেওয়া
- "take a break" - বিরতি নেওয়া
- "strong coffee" - শক্ত কফি
- "heavy rain" - ভারী বৃষ্টি
- "do homework" - বাড়ির কাজ করা
- "pay attention" - মনোযোগ দেওয়া

### Linking Phrase
- "on the other hand" - অন্যদিকে
- "in addition to" - এছাড়াও
- "as a result" - ফলস্বরূপ
- "for example" - উদাহরণস্বরূপ
- "in conclusion" - উপসংহারে
- "furthermore" - তদুপরি
- "however" - তবে
- "therefore" - সুতরাং
