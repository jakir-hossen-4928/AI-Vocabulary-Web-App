import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Vocabulary } from "@/types/vocabulary";
import { toast } from "sonner";
import { dbService } from "@/lib/db";
import { useEffect } from "react";

export const useVocabularies = () => {
    const queryClient = useQueryClient();

    // Hydrate from IDB on mount
    useEffect(() => {
        const loadFromCache = async () => {
            try {
                const cached = await dbService.getAllVocabularies();
                if (cached && cached.length > 0) {
                    // Set data in query cache and mark as stale to trigger background fetch
                    queryClient.setQueryData(["vocabularies"], cached, { updatedAt: 0 });
                }
            } catch (error) {
                console.error("Failed to load from cache:", error);
            }
        };
        loadFromCache();
    }, [queryClient]);

    const queryResult = useQuery({
        queryKey: ["vocabularies"],
        queryFn: async () => {
            try {
                const q = query(collection(db, "vocabularies"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const vocabularies = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Vocabulary[];

                // Sync to IDB: Clear and rewrite to ensure consistency
                await dbService.clear();
                await dbService.addVocabularies(vocabularies);

                return vocabularies;
            } catch (error) {
                console.warn("Network fetch failed, falling back to IDB", error);
                const cached = await dbService.getAllVocabularies();
                // If we have no cached data and fetch failed, throw error
                if (cached.length === 0) throw error;
                return cached;
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        ...queryResult,
        refresh: queryResult.refetch,
    };
};

export const useVocabularyMutations = () => {
    const queryClient = useQueryClient();

    const addVocabulary = useMutation({
        mutationFn: async (newVocab: Omit<Vocabulary, "id">) => {
            const docRef = await addDoc(collection(db, "vocabularies"), newVocab);
            return { id: docRef.id, ...newVocab } as Vocabulary;
        },
        onSuccess: async (newVocab) => {
            // Update IDB
            await dbService.addVocabulary(newVocab);

            // Optimistic Update: Manually add to cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return [newVocab];
                return [newVocab, ...oldData];
            });
            toast.success("Vocabulary added successfully");
        },
        onError: (error: any) => {
            console.error("Error adding vocabulary:", error);
            toast.error("Failed to add vocabulary");
        },
    });

    const updateVocabulary = useMutation({
        mutationFn: async ({ id, ...data }: Partial<Vocabulary> & { id: string }) => {
            await updateDoc(doc(db, "vocabularies", id), data);
            return { id, ...data };
        },
        onSuccess: async (updatedVocab) => {
            // Update IDB
            const currentCache = queryClient.getQueryData<Vocabulary[]>(["vocabularies"]);
            const fullVocab = currentCache?.find(v => v.id === updatedVocab.id);

            if (fullVocab) {
                const mergedVocab = { ...fullVocab, ...updatedVocab } as Vocabulary;
                await dbService.addVocabulary(mergedVocab);

                // Optimistic Update: Update item in cache
                queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                    if (!oldData) return oldData;
                    return oldData.map((item) =>
                        item.id === updatedVocab.id ? mergedVocab : item
                    );
                });
            }

            toast.success("Vocabulary updated successfully");
        },
        onError: (error: any) => {
            console.error("Error updating vocabulary:", error);
            toast.error("Failed to update vocabulary");
        },
    });

    const deleteVocabulary = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "vocabularies", id));
            return id;
        },
        onSuccess: async (deletedId) => {
            // Update IDB
            await dbService.deleteVocabulary(deletedId);

            // Optimistic Update: Remove from cache
            queryClient.setQueryData(["vocabularies"], (oldData: Vocabulary[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.filter((item) => item.id !== deletedId);
            });
            toast.success("Vocabulary deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting vocabulary:", error);
            toast.error("Failed to delete vocabulary");
        },
    });

    return { deleteVocabulary, addVocabulary, updateVocabulary };
};
