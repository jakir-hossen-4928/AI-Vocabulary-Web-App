// Local Storage for OpenAI Configuration and Usage Tracking

const OPENAI_API_KEY_STORAGE = 'openai_api_key';
const OPENAI_MODEL_STORAGE = 'openai_selected_model';
const CHAT_SESSIONS_STORAGE = 'openai_chat_sessions';
const TOKEN_USAGE_STORAGE = 'openai_token_usage';

// API Key Management
export const saveOpenAIApiKey = (apiKey: string): void => {
    try {
        localStorage.setItem(OPENAI_API_KEY_STORAGE, apiKey);
    } catch (error) {
        console.error('Failed to save API key:', error);
        throw new Error('Failed to save API key securely');
    }
};

export const getOpenAIApiKey = (): string | null => {
    try {
        return localStorage.getItem(OPENAI_API_KEY_STORAGE);
    } catch (error) {
        console.error('Failed to retrieve API key:', error);
        return null;
    }
};

export const removeOpenAIApiKey = (): void => {
    try {
        localStorage.removeItem(OPENAI_API_KEY_STORAGE);
    } catch (error) {
        console.error('Failed to remove API key:', error);
    }
};

export const hasOpenAIApiKey = (): boolean => {
    return !!getOpenAIApiKey();
};

// Model Selection
export const saveSelectedModel = (modelId: string): void => {
    try {
        localStorage.setItem(OPENAI_MODEL_STORAGE, modelId);
    } catch (error) {
        console.error('Failed to save model selection:', error);
    }
};

export const getSelectedModel = (): string | null => {
    try {
        return localStorage.getItem(OPENAI_MODEL_STORAGE);
    } catch (error) {
        console.error('Failed to retrieve model selection:', error);
        return null;
    }
};

// Chat Sessions
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    tokens?: {
        input: number;
        output: number;
        total: number;
    };
    cost?: number;
}

export interface ChatSession {
    id: string;
    vocabularyId: string;
    vocabularyWord: string;
    messages: ChatMessage[];
    totalTokens: number;
    totalCost: number;
    createdAt: number;
    updatedAt: number;
}

export const saveChatSession = (session: ChatSession): void => {
    try {
        const sessions = getAllChatSessions();
        const existingIndex = sessions.findIndex(s => s.id === session.id);

        if (existingIndex >= 0) {
            sessions[existingIndex] = session;
        } else {
            sessions.push(session);
        }

        localStorage.setItem(CHAT_SESSIONS_STORAGE, JSON.stringify(sessions));
    } catch (error) {
        console.error('Failed to save chat session:', error);
    }
};

export const getAllChatSessions = (): ChatSession[] => {
    try {
        const data = localStorage.getItem(CHAT_SESSIONS_STORAGE);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve chat sessions:', error);
        return [];
    }
};

export const getChatSessionByVocabulary = (vocabularyId: string): ChatSession | null => {
    try {
        const sessions = getAllChatSessions();
        return sessions.find(s => s.vocabularyId === vocabularyId) || null;
    } catch (error) {
        console.error('Failed to retrieve chat session:', error);
        return null;
    }
};

export const deleteChatSession = (sessionId: string): void => {
    try {
        const sessions = getAllChatSessions();
        const filtered = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem(CHAT_SESSIONS_STORAGE, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete chat session:', error);
    }
};

// Token Usage Tracking
export interface TokenUsageRecord {
    id: string;
    timestamp: number;
    vocabularyId: string;
    vocabularyWord: string;
    modelId: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
}

export const saveTokenUsage = (record: TokenUsageRecord): void => {
    try {
        const records = getAllTokenUsage();
        records.push(record);
        localStorage.setItem(TOKEN_USAGE_STORAGE, JSON.stringify(records));
    } catch (error) {
        console.error('Failed to save token usage:', error);
    }
};

export const getAllTokenUsage = (): TokenUsageRecord[] => {
    try {
        const data = localStorage.getItem(TOKEN_USAGE_STORAGE);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to retrieve token usage:', error);
        return [];
    }
};

export const getTotalSpending = (): { totalCost: number; totalTokens: number; recordCount: number } => {
    try {
        const records = getAllTokenUsage();
        const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
        const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
        return { totalCost, totalTokens, recordCount: records.length };
    } catch (error) {
        console.error('Failed to calculate total spending:', error);
        return { totalCost: 0, totalTokens: 0, recordCount: 0 };
    }
};

export const clearAllData = (): void => {
    try {
        localStorage.removeItem(CHAT_SESSIONS_STORAGE);
        localStorage.removeItem(TOKEN_USAGE_STORAGE);
    } catch (error) {
        console.error('Failed to clear data:', error);
    }
};