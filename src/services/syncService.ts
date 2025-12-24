import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from "firebase/firestore";
import { db as firestore } from "@/lib/firebase";
import { dexieService } from "@/lib/dexieDb";
import { Vocabulary } from "@/types/vocabulary";

const SYNC_KEY = 'vocabularies';

export const syncService = {
    isSyncing: false,

    /**
     * Optimized sync with Firebase
     * Pulls only changes since last sync to reduce costs and load time
     */
    async syncVocabularies(): Promise<boolean> {
        if (!navigator.onLine || this.isSyncing) return false;

        this.isSyncing = true;
        try {
            const lastSyncedAt = await dexieService.getSyncMetadata(SYNC_KEY);

            let q;
            if (lastSyncedAt) {
                // Only fetch items updated since last sync (incremental)
                const lastDate = new Date(lastSyncedAt);
                q = query(
                    collection(firestore, "vocabularies"),
                    where("updatedAt", ">", lastDate.toISOString()),
                    orderBy("updatedAt", "desc")
                );
            } else {
                // Initial sync: fetch everything
                q = query(
                    collection(firestore, "vocabularies"),
                    orderBy("updatedAt", "desc"),
                    limit(500) // Safety limit for initial load
                );
            }

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("[Sync] No new vocabulary changes found");
                await dexieService.updateSyncMetadata(SYNC_KEY);
                return true;
            }

            const remoteItems = snapshot.docs.map(doc => ({
                id: doc.id,
                ...(doc.data() as any)
            })) as Vocabulary[];

            console.log(`[Sync] Found ${remoteItems.length} new/updated items`);

            // Bulk update Dexie (overwrites local items with remote ones if IDs match)
            await dexieService.addVocabularies(remoteItems);
            await dexieService.updateSyncMetadata(SYNC_KEY);

            console.log("[Sync] Successfully merged remote changes into Dexie");
            return true;
        } catch (error: any) {
            console.error("[Sync] Vocabulary synchronization failed:", error);

            // Edge Case: If index is missing or query fails, try to fallback to a simple most-recent query
            // This is safer than failing completely, as it ensures we gets *some* updates
            if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                console.warn("[Sync] Falling back to simple query due to index issues...");
                try {
                    const fallbackQuery = query(
                        collection(firestore, "vocabularies"),
                        orderBy("updatedAt", "desc"),
                        limit(50)
                    );
                    const snapshot = await getDocs(fallbackQuery);
                    if (!snapshot.empty) {
                        const items = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })) as Vocabulary[];
                        await dexieService.addVocabularies(items);
                        return true;
                    }
                } catch (fallbackError) {
                    console.error("[Sync] Fallback failed:", fallbackError);
                }
            }
            return false;
        } finally {
            this.isSyncing = false;
        }
    },

    syncInterval: null as any,
    onlineListener: null as any,

    /**
     * Start a background sync manager
     */
    startSyncManager(intervalMinutes: number = 10) {
        if (this.syncInterval) return;

        // Periodic sync
        this.syncInterval = setInterval(() => {
            this.syncVocabularies();
        }, intervalMinutes * 60 * 1000);

        // Also sync when browser comes back online
        this.onlineListener = () => {
            console.log("[Sync] Device back online, triggered sync...");
            this.syncVocabularies();
        };
        window.addEventListener('online', this.onlineListener);

        // Initial sync on startup
        this.syncVocabularies();
    },

    /**
     * Stop the background sync manager and cleanup
     */
    stopSyncManager() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        if (this.onlineListener) {
            window.removeEventListener('online', this.onlineListener);
            this.onlineListener = null;
        }
    }
};
