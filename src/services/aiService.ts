export const generateVocabularyContent = async (
  banglaWord: string,
  englishMeaning: string,
  partOfSpeech: string,
  apiKey: string
) => {
  if (!apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  const prompt = `Generate detailed vocabulary information for:
Bangla word: ${banglaWord}
English meaning: ${englishMeaning}
Part of Speech: ${partOfSpeech}

Please provide:
1. Pronunciation (IPA format)
2. Two example sentences (one in Bangla, one in English for each)
3. Three synonyms
4. Two antonyms
5. A brief explanation (1-2 sentences)

Format the response as JSON with this structure:
{
  "pronunciation": "IPA pronunciation",
  "examples": [
    {"bn": "Bangla sentence", "en": "English sentence"},
    {"bn": "Bangla sentence 2", "en": "English sentence 2"}
  ],
  "synonyms": ["synonym1", "synonym2", "synonym3"],
  "antonyms": ["antonym1", "antonym2"],
  "explanation": "Brief explanation of the word"
}`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "x-ai/grok-4.1-fast:free",
      "messages": [
        {
          "role": "user",
          "content": prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
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
