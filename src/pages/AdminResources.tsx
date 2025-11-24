import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { uploadImage } from "@/services/imageService";
import { GrammarImage } from "@/types/grammar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Edit, Plus, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cleanTextContent } from "@/utils/textCleaner";

export default function AdminResources() {
    const [images, setImages] = useState<GrammarImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !isAdmin) {
            navigate("/");
            return;
        }
        fetchImages();
    }, [user, isAdmin, navigate]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "grammar_images"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            const fetchedImages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as GrammarImage[];
            setImages(fetchedImages);
        } catch (error) {
            console.error("Error fetching images:", error);
            toast.error("Failed to load resources");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            await handleUpdate();
        } else {
            await handleAdd();
        }
    };

    const handleAdd = async () => {
        if (!title.trim()) {
            toast.error("Please provide a title");
            return;
        }

        setUploading(true);
        try {
            let imageUrl = "";
            if (file) {
                imageUrl = await uploadImage(file);
            }

            const docData: any = {
                title: title.trim(),
                description: cleanTextContent(description),
                createdAt: new Date().toISOString(),
                userId: user!.uid
            };

            if (imageUrl) {
                docData.imageUrl = imageUrl;
            }

            await addDoc(collection(db, "grammar_images"), docData);

            toast.success("Resource added successfully");
            resetForm();
            fetchImages();
        } catch (error) {
            console.error("Error adding resource:", error);
            toast.error("Failed to add resource");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingId || !title.trim()) return;

        setUploading(true);
        try {
            const updateData: any = {
                title: title.trim(),
                description: cleanTextContent(description),
            };

            if (file) {
                const imageUrl = await uploadImage(file);
                updateData.imageUrl = imageUrl;
            }

            await updateDoc(doc(db, "grammar_images", editingId), updateData);

            toast.success("Resource updated successfully");
            resetForm();
            fetchImages();
        } catch (error) {
            console.error("Error updating resource:", error);
            toast.error("Failed to update resource");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this item?")) return;

        try {
            await deleteDoc(doc(db, "grammar_images", id));
            toast.success("Item deleted");
            setImages(images.filter(img => img.id !== id));
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item");
        }
    };

    const startEditing = (img: GrammarImage) => {
        setEditingId(img.id);
        setTitle(img.title);
        setDescription(img.description || "");
        setFile(null);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setFile(null);
        setEditingId(null);
        setIsFormOpen(false);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="min-h-screen bg-background pb-8">
            <motion.header
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate("/profile")}
                            className="text-primary-foreground hover:bg-primary-foreground/10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={() => {
                                if (isFormOpen) resetForm();
                                else setIsFormOpen(true);
                            }}
                            variant="secondary"
                            className="shadow-lg"
                        >
                            {isFormOpen ? (
                                <>
                                    <X className="mr-2 h-4 w-4" /> Close
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" /> Add New
                                </>
                            )}
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">Manage Resources Gallery</h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Create and manage educational articles and resources
                    </p>
                </div>
            </motion.header>

            <div className="max-w-6xl mx-auto px-4 -mt-6">
                <AnimatePresence>
                    {isFormOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="p-6 shadow-lg border-primary/20">
                                <h2 className="text-lg font-semibold mb-4">
                                    {editingId ? "Edit Resource" : "Add New Resource"}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Mastering Present Perfect"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description / Content</Label>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            Supports Markdown (e.g., **bold**, # Heading)
                                        </div>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Write a brief description or the full content..."
                                            className="mt-1 min-h-[150px] font-mono text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="image-upload">
                                            {editingId ? "Update Image (Optional)" : "Cover Image (Optional)"}
                                        </Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2 gap-2">
                                        {editingId && (
                                            <Button type="button" variant="outline" onClick={resetForm}>
                                                Cancel
                                            </Button>
                                        )}
                                        <Button type="submit" disabled={uploading}>
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    {editingId ? "Updating..." : "Publishing..."}
                                                </>
                                            ) : (
                                                editingId ? "Update Resource" : "Publish Resource"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((img, index) => (
                            <motion.div
                                key={img.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="overflow-hidden shadow-hover group h-full flex flex-col">
                                    <div className="relative aspect-video bg-muted">
                                        <img
                                            src={img.imageUrl}
                                            alt={img.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => startEditing(img)}
                                                className="h-8 w-8"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => handleDelete(img.id)}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-lg mb-2 line-clamp-1" title={img.title}>
                                            {img.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                                            {img.description || "No description available."}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-auto pt-2 border-t">
                                            {new Date(img.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
