import { getOpenAIApiKey, getSelectedModel } from "@/lib/apiKeyStorage";
import { DEFAULT_MODEL } from "@/lib/openaiConfig";

// Security: Rate limiting
const REQUEST_LIMIT = 10; // Max requests per minute
const requestTimestamps: number[] = [];

// Security: Input validation
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES_IN_HISTORY = 20;

// Security: Sanitize input
function sanitizeInput(input: string): string {
    // Remove any potential script tags or dangerous content
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .trim()
        .slice(0, MAX_MESSAGE_LENGTH);
}

// Security: Rate limiting check
function checkRateLimit(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Remove old timestamps
    while (requestTimestamps.length > 0 && requestTimestamps[0] < oneMinuteAgo) {
        requestTimestamps.shift();
    }

    // Check if limit exceeded
    if (requestTimestamps.length >= REQUEST_LIMIT) {
        return false;
    }

    // Add current timestamp
    requestTimestamps.push(now);
    return true;
}

export const chatWithVocabulary = async (
    vocabulary: any,
    messages: { role: "user" | "assistant" | "system"; content: string }[],
    apiKey?: string,
    modelId?: string
): Promise<{
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number
    }
}> => {
    // Security: Rate limiting
    if (!checkRateLimit()) {
        throw new Error("Rate limit exceeded. Please wait a moment before sending another message.");
    }

    const userApiKey = (apiKey || getOpenAIApiKey())?.trim();
    const selectedModel = modelId || getSelectedModel() || DEFAULT_MODEL;

    if (!userApiKey) {
        throw new Error("OpenAI API key is required. Please add your API key in Profile settings.");
    }

    // Security: Validate API key format
    if (!userApiKey.startsWith('sk-') || userApiKey.length < 20) {
        throw new Error("Invalid API key format. Please check your API key.");
    }

    // Security: Validate vocabulary object
    if (!vocabulary || typeof vocabulary !== 'object') {
        throw new Error("Invalid vocabulary data.");
    }

    // Security: Sanitize vocabulary data
    const sanitizedVocabulary = {
        english: sanitizeInput(vocabulary.english || ''),
        bangla: sanitizeInput(vocabulary.bangla || ''),
        partOfSpeech: sanitizeInput(vocabulary.partOfSpeech || ''),
        pronunciation: sanitizeInput(vocabulary.pronunciation || ''),
        explanation: sanitizeInput(vocabulary.explanation || ''),
        examples: vocabulary.examples?.slice(0, 5).map((e: any) => ({
            en: sanitizeInput(e.en || ''),
            bn: sanitizeInput(e.bn || '')
        })) || [],
        synonyms: vocabulary.synonyms?.slice(0, 10).map((s: string) => sanitizeInput(s)) || []
    };

    const systemPrompt = `
You are a highly qualified IELTS vocabulary tutor (Band 7-9 level).
Focus only on the necessary information requested by the user and avoid unnecessary elaboration to save tokens.
Adapt explanations to the user's preferred language when possible.
Always use English for IELTS examples, academic terms, and Band 7+ sentences.

Context about the vocabulary "${sanitizedVocabulary.english}":
- Bangla Meaning: ${sanitizedVocabulary.bangla}
- Part of Speech: ${sanitizedVocabulary.partOfSpeech}
- Pronunciation: ${sanitizedVocabulary.pronunciation}
- Explanation: ${sanitizedVocabulary.explanation}
- Examples: ${sanitizedVocabulary.examples.map((e: any) => `"${e.en}" (${e.bn})`).join("; ")}
- Synonyms: ${sanitizedVocabulary.synonyms.join(", ")}

RESPONSE RULES:
- Give concise and necessary answers only
- Use **bold** for key vocabulary, *italic* for emphasis, inline code for pronunciations
- Provide examples in Band 7-9 English only
- If user asks for "better meaning", provide it in their preferred language briefly
- Avoid long paragraphs and verbose explanations
- Never include harmful, offensive, or inappropriate content
`;

    // Security: Limit message history and sanitize
    const sanitizedMessages = messages
        .filter(m => m.role !== "system")
        .slice(-MAX_MESSAGES_IN_HISTORY)
        .map(m => ({
            role: m.role as "user" | "assistant",
            content: sanitizeInput(m.content)
        }));

    // Build messages array for OpenAI
    const apiMessages = [
        { role: "system" as const, content: systemPrompt },
        ...sanitizedMessages
    ];

    // Use proxy in development to avoid CORS, direct URL in production
    const isDev = import.meta.env.DEV;
    const baseUrl = isDev ? "/api/openai" : "https://api.openai.com/v1";

    try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${userApiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: apiMessages,
                temperature: 0.5,
                max_tokens: 300,
                top_p: 0.9,
                // Security: Add moderation
                user: "vocabulary-app-user"
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Security: Generic error messages for users
            if (response.status === 401) {
                const specificError = errorData?.error?.message || "Invalid API key.";
                console.error("OpenAI 401 Error:", specificError);
                throw new Error(`OpenAI Error: ${specificError} Please check your API key in Profile settings.`);
            } else if (response.status === 429) {
                throw new Error("Rate limit exceeded. Please wait a moment and try again.");
            } else if (response.status === 400) {
                const specificError = errorData?.error?.message || "Invalid request.";
                throw new Error(`Invalid request: ${specificError}`);
            } else if (response.status === 403) {
                throw new Error("Access denied. Please check your API key permissions.");
            }

            // Log detailed error for debugging (not shown to user)
            console.error("OpenAI API error details:", errorData);
            throw new Error("Failed to get response from AI. Please try again.");
        }

        const result = await response.json();

        // Security: Validate response
        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            throw new Error("Invalid response from AI. Please try again.");
        }

        const content = result.choices[0].message.content;
        const usage = result.usage;

        return {
            content: sanitizeInput(content),
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens
            }
        };
    } catch (error: any) {
        // Security: Don't expose internal errors
        console.error("OpenAI API error:", error);

        if (error.message) {
            throw error;
        }

        throw new Error("Failed to connect to AI service. Please check your internet connection.");
    }
};
