# Duplicate Detection and Management System

## Overview
A comprehensive system for detecting, reviewing, and managing duplicate vocabulary entries in your AI Vocabulary Coach application.

## Features

### 1. **Duplicate Detection**
- **Exact Duplicates**: Finds words with identical English spellings (case-insensitive, ignoring special characters)
- **Similar Duplicates**: Uses Levenshtein distance algorithm for fuzzy matching to find similar words
- **Configurable Threshold**: Adjust similarity percentage (default: 85%)

### 2. **Detection Algorithms**

#### Exact Matching
- Normalizes text by converting to lowercase, removing special characters
- Groups vocabularies by normalized English word
- Identifies groups with 2+ entries

#### Fuzzy Matching (Levenshtein Distance)
- Calculates edit distance between words
- Computes similarity percentage
- Finds words above similarity threshold
- Examples:
  - "color" vs "colour" → 91% similar
  - "organize" vs "organise" → 93% similar
  - "traveling" vs "travelling" → 90% similar

### 3. **Management Actions**

#### Auto-Merge (Exact Duplicates Only)
- Automatically merges all exact duplicate groups
- Keeps the newest entry's ID
- Combines all information from duplicates
- Deletes redundant entries
- **Use Case**: Quick cleanup of obvious duplicates

#### Manual Merge
- Review each duplicate group individually
- Combines information from all duplicates:
  - Keeps all unique examples
  - Merges all unique synonyms
  - Merges all unique antonyms
  - Uses the longest/most detailed explanation
  - Uses the most detailed pronunciation
- **Use Case**: Careful review before merging

#### Keep One
- Select which vocabulary to keep
- Delete all others in the group
- No merging of information
- **Use Case**: When one entry is clearly better than others

### 4. **Merge Logic**

When merging vocabularies, the system:

1. **Keeps**: Newest entry's ID and basic info
2. **Merges**:
   - **Examples**: All unique examples (based on English + Bangla text)
   - **Synonyms**: All unique synonyms (normalized comparison)
   - **Antonyms**: All unique antonyms (normalized comparison)
3. **Selects Best**:
   - **Explanation**: Longest/most detailed
   - **Pronunciation**: Most detailed
4. **Updates**: Sets `updatedAt` to current timestamp

### 5. **User Interface**

#### Statistics Dashboard
- Total vocabularies count
- Number of duplicate groups
- Exact duplicates count
- Similar duplicates count

#### Tabbed Interface
- **Exact Duplicates Tab**: Shows exact matches
- **Similar Duplicates Tab**: Shows fuzzy matches

#### Duplicate Group Card
- Shows English word and Bangla translation
- Displays duplicate count
- Badge indicating "Exact" or "Similar"
- Expandable to show all duplicates
- Action buttons for management

#### Individual Vocabulary Display
- Shows position in group (#1, #2, etc.)
- "Newest" badge for most recent entry
- Displays examples, synonyms count
- Shows creation date
- Selectable for "Keep One" action

### 6. **Responsive Design**
- Mobile-first approach
- Touch-friendly buttons
- Responsive text sizes
- Adaptive layouts for all screen sizes

## File Structure

```
src/
├── utils/
│   └── duplicateDetection.ts      # Core detection algorithms
├── hooks/
│   └── useDuplicateManagement.ts  # React Query mutations
└── pages/
    └── DuplicateManager.tsx       # UI component
```

## Usage

### For Admins

1. **Access**: Navigate to Profile → Duplicate Manager
2. **Review Statistics**: Check the dashboard for overview
3. **Auto-Merge** (Recommended for exact duplicates):
   - Click "Auto-Merge All Exact Duplicates"
   - Confirm the action
   - System merges all exact duplicates automatically

4. **Manual Review**:
   - Switch between "Exact" and "Similar" tabs
   - Click "Show" on any duplicate group
   - Review all entries
   - Choose action:
     - **Merge All**: Combines all information
     - **Keep Selected**: Select one, delete others

### Best Practices

1. **Start with Exact Duplicates**: These are safe to auto-merge
2. **Review Similar Duplicates Carefully**: May be different words
3. **Check Before Merging**: Expand groups to review content
4. **Regular Cleanup**: Run duplicate detection periodically

## API Reference

### Utility Functions

#### `normalizeText(text: string): string`
Normalizes text for comparison.

#### `levenshteinDistance(str1: string, str2: string): number`
Calculates edit distance between two strings.

#### `calculateSimilarity(str1: string, str2: string): number`
Returns similarity percentage (0-100).

#### `findExactDuplicates(vocabularies: Vocabulary[]): DuplicateGroup[]`
Finds all exact duplicate groups.

#### `findSimilarDuplicates(vocabularies: Vocabulary[], threshold?: number): DuplicateGroup[]`
Finds similar duplicates above threshold (default: 85%).

#### `findAllDuplicates(vocabularies: Vocabulary[], threshold?: number)`
Returns both exact and similar duplicates with statistics.

#### `mergeVocabularies(vocabularies: Vocabulary[]): Omit<Vocabulary, "id">`
Merges multiple vocabularies into one, keeping the most complete information.

#### `getDuplicateStats(vocabularies: Vocabulary[])`
Returns comprehensive statistics about duplicates.

### Hook Methods

#### `mergeDuplicates.mutateAsync({ group, keepId? })`
Merges a duplicate group, optionally specifying which ID to keep.

#### `keepOne.mutateAsync({ group, keepId })`
Keeps one vocabulary and deletes all others.

#### `autoMergeExactDuplicates.mutateAsync(groups)`
Auto-merges all exact duplicate groups.

## Performance Considerations

- **Exact Matching**: O(n) - Very fast
- **Fuzzy Matching**: O(n²) - Slower for large datasets
- **Recommendation**: For 1000+ vocabularies, consider running detection in background

## Future Enhancements

1. **Batch Operations**: Select multiple groups to merge at once
2. **Undo Functionality**: Revert recent merge operations
3. **Duplicate Prevention**: Check for duplicates before adding new words
4. **Advanced Filters**: Filter by part of speech, creation date
5. **Export Report**: Download duplicate analysis as CSV/PDF
6. **Scheduled Scans**: Automatic periodic duplicate detection
7. **Machine Learning**: Smarter duplicate detection using embeddings

## Troubleshooting

### No Duplicates Found
- Check if vocabularies are loaded
- Verify database connection
- Try lowering similarity threshold for similar duplicates

### Merge Failed
- Check Firebase permissions
- Verify network connection
- Check browser console for errors

### Performance Issues
- Reduce similarity threshold
- Process duplicates in smaller batches
- Clear browser cache

## Security

- Only admin users can access duplicate manager
- All operations require authentication
- Firebase security rules enforce permissions
- Batch operations are atomic (all or nothing)

## Testing Recommendations

1. **Create Test Duplicates**: Add known duplicates for testing
2. **Test Edge Cases**:
   - Single character differences
   - Special characters
   - Different languages
3. **Verify Merge Logic**: Check that information is properly combined
4. **Test Rollback**: Ensure deleted items are properly removed from cache

## Route

- **URL**: `/admin/duplicates`
- **Access**: Admin only
- **Navigation**: Profile → Duplicate Manager
