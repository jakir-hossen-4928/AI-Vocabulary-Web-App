import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    updateDoc,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 12; // Grid layout usually fits 3 or 4 columns, so 12 is a good number

export const useResources = (searchQuery: string = "") => {
    return useInfiniteQuery({
        queryKey: ["resources", searchQuery],
        queryFn: async ({ pageParam }: { pageParam?: DocumentSnapshot }) => {
            let q = collection(db, "grammar_images");
            let constraints: any[] = [];

            // Note: Search is client-side for now as discussed,
            // but we fetch paginated data sorted by date.
            // If we wanted server-side search, we'd need prefix search on 'title'.

            constraints.push(orderBy("createdAt", "desc"));

            if (pageParam) {
                constraints.push(startAfter(pageParam));
            }

            constraints.push(limit(ITEMS_PER_PAGE));

            const finalQuery = query(q, ...constraints);
            const snapshot = await getDocs(finalQuery);

            const resources = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as GrammarImage[];

            return {
                items: resources,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
                hasMore: snapshot.docs.length === ITEMS_PER_PAGE
            };
        },
        getNextPageParam: (lastPage) => {
            return lastPage.hasMore ? lastPage.lastDoc : undefined;
        },
        initialPageParam: undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useResourceMutations = () => {
    const queryClient = useQueryClient();

    const addResource = useMutation({
        mutationFn: async (newResource: any) => {
            const docRef = await addDoc(collection(db, "grammar_images"), newResource);
            return { id: docRef.id, ...newResource };
        },
        onSuccess: (newResource) => {
            // Optimistic Update
            queryClient.setQueryData(["resources", ""], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: [
                        {
                            ...oldData.pages[0],
                            items: [newResource, ...oldData.pages[0].items],
                        },
                        ...oldData.pages.slice(1),
                    ],
                };
            });
            toast.success("Resource added successfully");
        },
        onError: (error: any) => {
            console.error("Error adding resource:", error);
            toast.error("Failed to add resource");
        },
    });

    const updateResource = useMutation({
        mutationFn: async ({ id, ...data }: Partial<GrammarImage> & { id: string }) => {
            await updateDoc(doc(db, "grammar_images", id), data);
            return { id, ...data };
        },
        onSuccess: (updatedResource) => {
            // Optimistic Update
            queryClient.setQueriesData({ queryKey: ["resources"] }, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        items: page.items.map((item: GrammarImage) =>
                            item.id === updatedResource.id ? { ...item, ...updatedResource } : item
                        ),
                    })),
                };
            });
            toast.success("Resource updated successfully");
        },
        onError: (error: any) => {
            console.error("Error updating resource:", error);
            toast.error("Failed to update resource");
        },
    });

    const deleteResource = useMutation({
        mutationFn: async (id: string) => {
            await deleteDoc(doc(db, "grammar_images", id));
            return id;
        },
        onSuccess: (deletedId) => {
            // Optimistic Update
            queryClient.setQueriesData({ queryKey: ["resources"] }, (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        items: page.items.filter((item: GrammarImage) => item.id !== deletedId),
                    })),
                };
            });
            toast.success("Resource deleted");
        },
        onError: (error: any) => {
            console.error("Error deleting resource:", error);
            toast.error("Failed to delete resource");
        },
    });

    return { addResource, updateResource, deleteResource };
};
