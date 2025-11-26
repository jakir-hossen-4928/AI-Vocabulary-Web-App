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
2. Part of Speech (e.g., Noun, Verb, Adjective)
3. Pronunciation (Bangla phonetic)
4. Explanation (Brief definition in English)
5. Synonyms (5 words)
6. Antonyms (5 words)
7. Examples (2 sentences with Bangla translation)

Format the output EXACTLY as this JSON:
{
  "bangla": "string",
  "english": "${word}",
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
