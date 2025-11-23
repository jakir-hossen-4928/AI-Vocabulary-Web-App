export const generateVocabularyContent = async (
  banglaWord: string,
  englishMeaning: string,
  partOfSpeech: string,
  apiKey?: string
) => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const keyToUse = apiKey || OPENAI_API_KEY;

  if (!keyToUse) {
    throw new Error("OpenAI API key is required");
  }

  const prompt = `
Generate detailed, high-quality vocabulary information suitable for IELTS Band 7+ learners.

Bangla word: ${banglaWord}
English meaning: ${englishMeaning}
Part of Speech: ${partOfSpeech}

You must provide:

1. Pronunciation
   - Bangla phonetic pronunciation of the English word (e.g., for 'Knowledge', write 'নলেজ')

2. Two example sentences
   - Each example must have:
     • One English sentence written in IELTS Band 7+ style
     • One Bangla translation of that English sentence (NOT transliteration)
   - English sentences must be natural, formal, and academically appropriate.

3. Synonyms
   - Provide 5 English synonyms that match IELTS Band 7–9 vocabulary level.

4. Antonyms
   - Provide 5 English antonyms (also at IELTS Band 7–9 level if possible).

5. Explanation
   - A brief (1–2 sentence) clear definition in English suitable for IELTS learners.

Format the final output EXACTLY in this JSON structure:

{
  "pronunciation": "Bangla phonetic pronunciation",
  "examples": [
    {"bn": "Bangla translation of the sentence", "en": "IELTS Band 7+ English example sentence"},
    {"bn": "Bangla translation of the sentence 2", "en": "IELTS Band 7+ English example sentence 2"}
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3", "synonym4", "synonym5"],
  "antonyms": ["antonym1", "antonym2", "antonym3", "antonym4", "antonym5"],
  "explanation": "Brief IELTS-friendly explanation"
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${keyToUse}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ],
      "response_format": { "type": "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.choices[0].message.content;

  // Extract JSON from markdown code blocks if present
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response");
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonText);
};

export const generateVocabularyFromWord = async (word: string, apiKey?: string) => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const keyToUse = apiKey || OPENAI_API_KEY;

  if (!keyToUse) {
    throw new Error("OpenAI API key is required");
  }

  const prompt = `
Generate detailed vocabulary information for the English word: "${word}".
Target audience: IELTS Band 7+ learners (Bangla speakers).

You must provide:
1. Bangla Meaning (most common/appropriate meaning)
2. English Meaning (brief definition)
3. Part of Speech (e.g., Noun, Verb, Adjective)
4. Pronunciation (Bangla phonetic)
5. Explanation (1-2 sentences)
6. Synonyms (5 words)
7. Antonyms (5 words)
8. Examples (2 sentences with Bangla translation)

Format the output EXACTLY as this JSON:
{
  "bangla": "string",
  "english": "string",
  "partOfSpeech": "string",
  "pronunciation": "string",
  "explanation": "string",
  "synonyms": ["string"],
  "antonyms": ["string"],
  "examples": [
    {"en": "string", "bn": "string"}
  ]
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${keyToUse}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ],
      "response_format": { "type": "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const result = await response.json();
  const text = result.choices[0].message.content;

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response");
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonText);
};
