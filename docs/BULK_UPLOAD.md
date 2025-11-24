# Bulk Vocabulary Upload Feature

## Overview
A new admin feature has been added to upload multiple vocabulary words at once using JSON or CSV format.

## Access
- **URL**: `/vocabularies/bulk-add`
- **Permission**: Admin only
- **Navigation**: From the Vocabularies page, click the "Bulk Upload" button in the header

## Features

### 1. **Dual Format Support**
- **JSON Format**: Upload structured JSON data with full vocabulary details
- **CSV Format**: Upload comma-separated values for quick bulk imports

### 2. **Template Downloads**
- Download pre-formatted templates for both JSON and CSV
- Templates include sample data showing the correct format

### 3. **File Upload**
- Direct file upload support for `.json` and `.csv` files
- Automatic parsing and validation

### 4. **Manual Input**
- Paste data directly into text areas
- Real-time validation

### 5. **Progress Tracking**
- Visual progress bar during upload
- Real-time percentage display

### 6. **Error Reporting**
- Detailed error messages for failed uploads
- Row-by-row error tracking
- Success/failure summary

## Data Format

### JSON Format
```json
[
  {
    "english": "Serendipity",
    "bangla": "আকস্মিক প্রাপ্তি",
    "partOfSpeech": "Noun",
    "pronunciation": "/ˌser.ənˈdɪp.ə.ti/",
    "explanation": "The occurrence of events by chance in a happy or beneficial way",
    "synonyms": ["luck", "fortune", "chance"],
    "antonyms": ["misfortune", "bad luck"],
    "examples": [
      {
        "en": "Finding that book was pure serendipity",
        "bn": "সেই বইটি খুঁজে পাওয়া ছিল সম্পূর্ণ আকস্মিক প্রাপ্তি"
      }
    ]
  }
]
```

### CSV Format
```csv
english,bangla,partOfSpeech,pronunciation,explanation,synonyms,antonyms,examples_en,examples_bn
"Serendipity","আকস্মিক প্রাপ্তি","Noun","/ˌser.ənˈdɪp.ə.ti/","The occurrence of events by chance","luck;fortune","misfortune","Example sentence","উদাহরণ বাক্য"
```

**CSV Notes:**
- Use semicolons (`;`) to separate multiple synonyms/antonyms
- Wrap values in quotes if they contain commas
- Only one example per row (for simplicity)

## Required Fields
- `english` - The English word (required)
- `bangla` - The Bangla meaning (required)

## Optional Fields
- `partOfSpeech` - Part of speech (Noun, Verb, etc.)
- `pronunciation` - IPA pronunciation
- `explanation` - Detailed explanation
- `synonyms` - Array of synonyms
- `antonyms` - Array of antonyms
- `examples` - Array of example sentences with translations

## Validation
- Validates required fields before upload
- Checks for empty values
- Provides specific error messages for each failed row
- Continues processing valid rows even if some fail

## Performance
- Batch processing using Firestore batch writes
- Optimized for up to 500 words per upload
- Progress tracking for large uploads

## Text Cleaning
All content is automatically cleaned using the `cleanTextContent` utility to:
- Remove hidden characters from AI chatbot pastes
- Normalize whitespace
- Remove control characters
- Preserve markdown formatting

## Usage Instructions

1. **Navigate to Bulk Upload**
   - Go to Vocabularies page
   - Click "Bulk Upload" button (admin only)

2. **Choose Format**
   - Select JSON or CSV tab

3. **Get Template**
   - Click "Download Template" to see the correct format

4. **Prepare Data**
   - Fill in your vocabulary data following the template format
   - Ensure required fields are present

5. **Upload**
   - Either paste data directly or upload a file
   - Click "Upload JSON Data" or "Upload CSV Data"

6. **Review Results**
   - Check success/failure summary
   - Review any error messages
   - Upload more or view vocabularies

## Benefits
- **Time-saving**: Add hundreds of words at once
- **Consistency**: Template ensures correct format
- **Error handling**: Clear feedback on what went wrong
- **Flexibility**: Support for both JSON and CSV formats
- **User-friendly**: Download templates, paste, and upload
