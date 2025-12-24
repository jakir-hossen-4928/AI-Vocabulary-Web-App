export const enhanceVocabulary = async (vocab: any, apiKey?: string, specificFields?: string[]) => {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    const keyToUse = apiKey || localStorage.getItem("openai_api_key") || OPENAI_API_KEY;

    if (!keyToUse) {
        throw new Error("OpenAI API key is required");
    }

    // Determine what fields need enhancement
    let needsEnhancement: string[] = [];

    // Check verb forms (only for verbs)
    if (vocab.partOfSpeech === "Verb" && !vocab.verbForms) {
        needsEnhancement.push("verbForms");
    }

    // Check synonyms
    if (!vocab.synonyms || vocab.synonyms.length < 3) {
        needsEnhancement.push("synonyms");
    }

    // Check antonyms
    if (!vocab.antonyms || vocab.antonyms.length < 3) {
        needsEnhancement.push("antonyms");
    }

    // Check examples
    if (!vocab.examples || vocab.examples.length === 0) {
        needsEnhancement.push("examples");
    }

    // Check related words
    if (!vocab.relatedWords || vocab.relatedWords.length === 0) {
        needsEnhancement.push("relatedWords");
    }

    // Check pronunciation
    if (!vocab.pronunciation || vocab.pronunciation.trim() === "") {
        needsEnhancement.push("pronunciation");
    }

    // Check explanation
    if (!vocab.explanation || vocab.explanation.length < 50) {
        needsEnhancement.push("explanation");
    }

    // If specific fields are requested, filter to only those that are missing
    if (specificFields && specificFields.length > 0 && !specificFields.includes("all")) {
        needsEnhancement = needsEnhancement.filter(field => specificFields.includes(field));
    }

    // If nothing needs enhancement, return empty object
    if (needsEnhancement.length === 0) {
        return {};
    }

    // Use development proxy if in dev mode
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? "/api/openai" : "https://api.openai.com/v1";

    // Build optimized prompt with specific rules for missing fields only
    let rules = "";
    if (needsEnhancement.includes("explanation")) {
        rules += `
- explanation: MUST be in native Bangla including ALL 5 points: 1. কোথায় ব্যবহার হয়, 2. কেন ব্যবহার হয়, 3. কিভাবে ব্যবহার করতে হয়, 4. বাস্তব জীবনের গাইডলাইন, 5. মনে রাখার লজিক। Medium length. Template: "এই শব্দটি তখন ব্যবহার করা হয় যখন [context]। এটি [purpose] বোঝাতে ব্যবহৃত হয়। বাস্তব জীবনে [real scenario]। মনে রাখার উপায়: [trick]। [usage]।"`;
    }
    if (needsEnhancement.includes("bangla")) { // Although usually present, might be requested
        rules += `
- bangla: Short, simple, native Bangladeshi style (comma for 2 meanings). NO slash (/). Native: "যে আগে থেকে সব সহজে বুঝে ফেলে" (NOT "স্বজ্ঞাত").`;
    }
    if (needsEnhancement.includes("pronunciation")) {
        rules += `
- pronunciation: Format "us: /IPA/ BD: বাংলা-উচ্চারণ" (e.g. "us: /ˈmɪt.ɪ.ɡeɪt/ BD: মিটিগেইট").`;
    }
    if (needsEnhancement.includes("synonyms")) {
        rules += `
- synonyms: Array of 5+ words (IELTS 8+ academic level).`;
    }
    if (needsEnhancement.includes("antonyms")) {
        rules += `
- antonyms: Array of 5+ words (IELTS 8+ academic level).`;
    }
    if (needsEnhancement.includes("examples")) {
        rules += `
- examples: Array of 1-2 objects [{"en": "string", "bn": "string"}]. Natural IELTS writing style (no "IELTS" mention). Bangla: native conversational style (use যেটা, কিভাবে, হয়ে যাওয়া).`;
    }
    if (needsEnhancement.includes("verbForms")) {
        rules += `
- verbForms: Object {"base": "", "v2": "", "v3": "", "ing": "", "s_es": ""}.`;
    }
    if (needsEnhancement.includes("relatedWords")) {
        rules += `
- relatedWords: Array of 2-3 objects [{"word": "", "partOfSpeech": "", "meaning": "", "example": ""}]. Different POS.`;
    }

    const prompt = `Role: You are an IELTS trainer generating Band 7+ vocabulary enhancements.
Task: Generate JSON for missing fields of: "${vocab.english}" (${vocab.partOfSpeech}).
Context: ${vocab.bangla}
Missing Fields: ${needsEnhancement.join(", ")}

RULES:
${rules}

Return ONLY valid JSON. No markdown.`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${keyToUse}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant that outputs only valid JSON."
                },
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

    let jsonText = text.trim();
    // Helper to extract JSON if wrapped in markdown
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Could not parse AI response as valid JSON");
    }
    jsonText = jsonMatch[0];

    const parsed = JSON.parse(jsonText);

    // Only return the fields that were requested
    const filteredEnhancements: any = {};
    needsEnhancement.forEach(field => {
        if (parsed[field] !== undefined) {
            filteredEnhancements[field] = parsed[field];
        }
    });

    return filteredEnhancements;
};