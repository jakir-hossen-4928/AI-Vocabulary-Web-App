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
import { Card } from "@/components/ui/card";
import { Loader2, Trash2, Edit, Plus, ArrowLeft, Save, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminGrammar() {
    const [images, setImages] = useState<GrammarImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
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
            toast.error("Failed to load images");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !file) {
            toast.error("Please provide a title and an image");
            return;
        }

        setUploading(true);
        try {
            const imageUrl = await uploadImage(file);

            await addDoc(collection(db, "grammar_images"), {
                title: title.trim(),
                imageUrl,
                createdAt: new Date().toISOString(),
                userId: user!.uid
            });

            toast.success("Grammar image added successfully");
            setTitle("");
            setFile(null);
            setIsFormOpen(false);
            // Reset file input manually if needed
            const fileInput = document.getElementById('image-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

            fetchImages();
        } catch (error) {
            console.error("Error adding image:", error);
            toast.error("Failed to add image");
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
        setEditTitle(img.title);
    };

    const saveEdit = async () => {
        if (!editingId || !editTitle.trim()) return;

        try {
            await updateDoc(doc(db, "grammar_images", editingId), {
                title: editTitle.trim()
            });

            setImages(images.map(img =>
                img.id === editingId ? { ...img, title: editTitle.trim() } : img
            ));

            setEditingId(null);
            toast.success("Title updated");
        } catch (error) {
            console.error("Error updating title:", error);
            toast.error("Failed to update title");
        }
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
                            onClick={() => setIsFormOpen(!isFormOpen)}
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
                    <h1 className="text-2xl font-bold mb-1">Manage Grammar</h1>
                    <p className="text-primary-foreground/80 text-sm">
                        Add or remove grammar reference images
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
                                <h2 className="text-lg font-semibold mb-4">Add New Image</h2>
                                <form onSubmit={handleAdd} className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Present Tense Rules"
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="image-upload">Image</Label>
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={uploading}>
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                "Upload Image"
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
                                <Card className="overflow-hidden shadow-hover group">
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
                                    <div className="p-4">
                                        {editingId === img.id ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="h-8"
                                                />
                                                <Button size="icon" className="h-8 w-8" onClick={saveEdit}>
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <h3 className="font-medium truncate" title={img.title}>
                                                {img.title}
                                            </h3>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Added {new Date(img.createdAt).toLocaleDateString()}
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
