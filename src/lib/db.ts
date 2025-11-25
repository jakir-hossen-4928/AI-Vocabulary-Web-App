import { openDB, DBSchema } from 'idb';
import { Vocabulary } from '@/types/vocabulary';

interface VocabDB extends DBSchema {
    vocabularies: {
        key: string;
        value: Vocabulary;
        indexes: { 'by-date': string };
    };
}

const DB_NAME = 'vocab-db';
const DB_VERSION = 1;

export const initDB = async () => {
    try {
        return await openDB<VocabDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                if (!db.objectStoreNames.contains('vocabularies')) {
                    const store = db.createObjectStore('vocabularies', {
                        keyPath: 'id',
                    });
                    store.createIndex('by-date', 'createdAt');
                }
            },
        });
    } catch (error) {
        console.error('IndexedDB initialization failed:', error);
        // Return null if IndexedDB is not available
        return null;
    }
};

export const dbService = {
    async getAllVocabularies() {
        try {
            const db = await initDB();
            if (!db) return [];
            // Return in descending order (newest first)
            return (await db.getAllFromIndex('vocabularies', 'by-date')).reverse();
        } catch (error) {
            console.error('Failed to get vocabularies from IndexedDB:', error);
            return [];
        }
    },

    async getVocabulary(id: string) {
        try {
            const db = await initDB();
            if (!db) return undefined;
            return db.get('vocabularies', id);
        } catch (error) {
            console.error('Failed to get vocabulary from IndexedDB:', error);
            return undefined;
        }
    },

    async addVocabulary(vocab: Vocabulary) {
        try {
            const db = await initDB();
            if (!db) return;
            return db.put('vocabularies', vocab);
        } catch (error) {
            console.error('Failed to add vocabulary to IndexedDB:', error);
        }
    },

    async addVocabularies(vocabs: Vocabulary[]) {
        try {
            const db = await initDB();
            if (!db) return;
            const tx = db.transaction('vocabularies', 'readwrite');
            await Promise.all([
                ...vocabs.map(v => tx.store.put(v)),
                tx.done
            ]);
        } catch (error) {
            console.error('Failed to add vocabularies to IndexedDB:', error);
        }
    },

    async deleteVocabulary(id: string) {
        try {
            const db = await initDB();
            if (!db) return;
            return db.delete('vocabularies', id);
        } catch (error) {
            console.error('Failed to delete vocabulary from IndexedDB:', error);
        }
    },

    async clear() {
        try {
            const db = await initDB();
            if (!db) return;
            return db.clear('vocabularies');
        } catch (error) {
            console.error('Failed to clear IndexedDB:', error);
        }
    }
};
