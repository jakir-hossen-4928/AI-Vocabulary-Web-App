import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Vocabulary } from "@/types/vocabulary";
import { toast } from "sonner";

export const useVocabularies = () => {
    return useQuery({
        queryKey: ["vocabularies"],
        queryFn: async () => {
            const snapshot = await getDocs(collection(db, "vocabularies"));
            const vocabs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Vocabulary[];

            // Client-side sort
            return vocabs.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        },
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        gcTime: 1000 * 60 * 60 * 24 * 2, // 48 hours
    });
};

export const useVocabularyMutations = () => {
    const queryClient = useQueryClient();

    const addVocabulary = useMutation({
        mutationFn: async (newVocab: Omit<Vocabulary, "id">) => {
            await addDoc(collection(db, "vocabularies"), newVocab);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
        },
        onError: (error: any) => {
            console.error("Error adding vocabulary:", error);
            throw error;
        },
    });

    const updateVocabulary = useMutation({
        mutationFn: async ({ id, ...data }: Partial<Vocabulary> & { id: string }) => {
            await updateDoc(doc(db, "vocabularies", id), data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
        },
        onError: (error: any) => {
            console.error("Error updating vocabulary:", error);
            throw error;
        },
    });

    const deleteVocabulary = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "vocabularies", id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vocabularies"] });
            toast.success("Vocabulary deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting vocabulary:", error);
            toast.error("Failed to delete vocabulary");
        },
    });

    return { deleteVocabulary, addVocabulary, updateVocabulary };
};
