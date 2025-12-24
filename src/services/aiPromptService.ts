import { Vocabulary } from "@/types/vocabulary";

export const aiPrompts = {
    improveMeaning: (vocab: Vocabulary) =>
        `The current Bangla meaning "${vocab.bangla}" is confusing. Please provide a better, easier, native-style Bangla meaning.`,

    chatSuggestions: [
        "Give me 3 example sentences",
        "What are some synonyms?",
        "Explain the meaning in simple terms",
        "How to use in IELTS writing?"
    ],

    welcomeMessage: (englishWord: string, serviceInfo: string) =>
        `Hello! Ask me anything about **"${englishWord}"**. I can help with meanings, examples, synonyms, and usage.\n\n*Powered by ${serviceInfo}*`,

    chatPlaceholder: "Ask about this word...",

    translateError: "Translation failed. Please try again.",

    aiServiceRequired: "AI Service Required",

    configureOpenRouter: "Please configure OpenRouter to start chatting."
};
