import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: number;
}

interface ChatSession {
    id: string;
    vocabularyId: string;
    vocabularyEnglish: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

interface TokenUsage {
    id: string;
    timestamp: number;
    vocabularyId: string;
    vocabularyEnglish: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    model: string;
    userId?: string;
}

interface ChatDB extends DBSchema {
    chatSessions: {
        key: string;
        value: ChatSession;
        indexes: {
            'by-vocabulary': string;
            'by-date': number;
        };
    };
    tokenUsage: {
        key: string;
        value: TokenUsage;
        indexes: {
            'by-date': number;
            'by-user': string;
            'by-vocabulary': string;
        };
    };
}

class ChatStorageService {
    private dbPromise: Promise<IDBPDatabase<ChatDB>>;

    constructor() {
        this.dbPromise = this.initDB();
    }

    private async initDB(): Promise<IDBPDatabase<ChatDB>> {
        return openDB<ChatDB>('vocabulary-chat-db', 1, {
            upgrade(db) {
                // Chat Sessions Store
                if (!db.objectStoreNames.contains('chatSessions')) {
                    const chatStore = db.createObjectStore('chatSessions', { keyPath: 'id' });
                    chatStore.createIndex('by-vocabulary', 'vocabularyId');
                    chatStore.createIndex('by-date', 'updatedAt');
                }

                // Token Usage Store
                if (!db.objectStoreNames.contains('tokenUsage')) {
                    const tokenStore = db.createObjectStore('tokenUsage', { keyPath: 'id' });
                    tokenStore.createIndex('by-date', 'timestamp');
                    tokenStore.createIndex('by-user', 'userId');
                    tokenStore.createIndex('by-vocabulary', 'vocabularyId');
                }
            },
        });
    }

    // Chat Session Methods
    async saveChatSession(session: ChatSession): Promise<void> {
        const db = await this.dbPromise;
        await db.put('chatSessions', session);
    }

    async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
        const db = await this.dbPromise;
        return db.get('chatSessions', sessionId);
    }

    async getChatSessionsByVocabulary(vocabularyId: string): Promise<ChatSession[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex('chatSessions', 'by-vocabulary', vocabularyId);
    }

    async getAllChatSessions(): Promise<ChatSession[]> {
        const db = await this.dbPromise;
        return db.getAll('chatSessions');
    }

    async deleteChatSession(sessionId: string): Promise<void> {
        const db = await this.dbPromise;
        await db.delete('chatSessions', sessionId);
    }

    async clearOldChatSessions(daysToKeep: number = 30): Promise<void> {
        const db = await this.dbPromise;
        const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        const allSessions = await db.getAll('chatSessions');

        const tx = db.transaction('chatSessions', 'readwrite');
        for (const session of allSessions) {
            if (session.updatedAt < cutoffDate) {
                await tx.store.delete(session.id);
            }
        }
        await tx.done;
    }

    // Token Usage Methods
    async saveTokenUsage(usage: TokenUsage): Promise<void> {
        const db = await this.dbPromise;
        await db.put('tokenUsage', usage);
    }

    async getTokenUsageByDateRange(startDate: number, endDate: number): Promise<TokenUsage[]> {
        const db = await this.dbPromise;
        const allUsage = await db.getAllFromIndex('tokenUsage', 'by-date');
        return allUsage.filter(u => u.timestamp >= startDate && u.timestamp <= endDate);
    }

    async getTokenUsageByUser(userId: string): Promise<TokenUsage[]> {
        const db = await this.dbPromise;
        return db.getAllFromIndex('tokenUsage', 'by-user', userId);
    }

    async getTotalTokenUsage(userId?: string): Promise<{
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalRequests: number;
    }> {
        const db = await this.dbPromise;
        const allUsage = userId
            ? await db.getAllFromIndex('tokenUsage', 'by-user', userId)
            : await db.getAll('tokenUsage');

        return allUsage.reduce((acc, usage) => ({
            totalPromptTokens: acc.totalPromptTokens + usage.promptTokens,
            totalCompletionTokens: acc.totalCompletionTokens + usage.completionTokens,
            totalTokens: acc.totalTokens + usage.totalTokens,
            totalRequests: acc.totalRequests + 1,
        }), {
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            totalRequests: 0,
        });
    }

    async getMonthlyTokenUsage(userId?: string): Promise<{
        month: string;
        totalTokens: number;
        totalRequests: number;
    }[]> {
        const db = await this.dbPromise;
        const allUsage = userId
            ? await db.getAllFromIndex('tokenUsage', 'by-user', userId)
            : await db.getAll('tokenUsage');

        const monthlyData = new Map<string, { totalTokens: number; totalRequests: number }>();

        allUsage.forEach(usage => {
            const date = new Date(usage.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            const existing = monthlyData.get(monthKey) || { totalTokens: 0, totalRequests: 0 };
            monthlyData.set(monthKey, {
                totalTokens: existing.totalTokens + usage.totalTokens,
                totalRequests: existing.totalRequests + 1,
            });
        });

        return Array.from(monthlyData.entries())
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month));
    }

    async clearOldTokenUsage(daysToKeep: number = 90): Promise<void> {
        const db = await this.dbPromise;
        const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        const allUsage = await db.getAll('tokenUsage');

        const tx = db.transaction('tokenUsage', 'readwrite');
        for (const usage of allUsage) {
            if (usage.timestamp < cutoffDate) {
                await tx.store.delete(usage.id);
            }
        }
        await tx.done;
    }

    // Utility Methods
    async exportChatHistory(): Promise<string> {
        const db = await this.dbPromise;
        const sessions = await db.getAll('chatSessions');
        return JSON.stringify(sessions, null, 2);
    }

    async exportTokenUsage(): Promise<string> {
        const db = await this.dbPromise;
        const usage = await db.getAll('tokenUsage');
        return JSON.stringify(usage, null, 2);
    }

    async clearAllData(): Promise<void> {
        const db = await this.dbPromise;
        const tx = db.transaction(['chatSessions', 'tokenUsage'], 'readwrite');
        await tx.objectStore('chatSessions').clear();
        await tx.objectStore('tokenUsage').clear();
        await tx.done;
    }
}

export const chatStorageService = new ChatStorageService();

export type { ChatMessage, ChatSession, TokenUsage };
