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
    return openDB<VocabDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('vocabularies')) {
                const store = db.createObjectStore('vocabularies', {
                    keyPath: 'id',
                });
                store.createIndex('by-date', 'createdAt');
            }
        },
    });
};

export const dbService = {
    async getAllVocabularies() {
        const db = await initDB();
        // Return in descending order (newest first)
        return (await db.getAllFromIndex('vocabularies', 'by-date')).reverse();
    },

    async getVocabulary(id: string) {
        const db = await initDB();
        return db.get('vocabularies', id);
    },

    async addVocabulary(vocab: Vocabulary) {
        const db = await initDB();
        return db.put('vocabularies', vocab);
    },

    async addVocabularies(vocabs: Vocabulary[]) {
        const db = await initDB();
        const tx = db.transaction('vocabularies', 'readwrite');
        await Promise.all([
            ...vocabs.map(v => tx.store.put(v)),
            tx.done
        ]);
    },

    async deleteVocabulary(id: string) {
        const db = await initDB();
        return db.delete('vocabularies', id);
    },

    async clear() {
        const db = await initDB();
        return db.clear('vocabularies');
    }
};
