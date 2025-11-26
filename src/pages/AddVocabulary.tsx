import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary, VocabularyExample } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { generateVocabularyFromWord } from "@/services/openaiService";
import { useVocabularyMutations } from "@/hooks/useVocabularies";
import { motion } from "framer-motion";

const PARTS_OF_SPEECH = [
  "Noun",
  "Pronoun",
  "Verb",
  "Adjective",
  "Adverb",
  "Preposition",
  "Conjunction",
  "Interjection",
  "Phrase",
  "Idiom",
  "Phrasal Verb",
  "Collocation",
  "Linking Phrase",
];

export default function AddVocabulary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addVocabulary, updateVocabulary } = useVocabularyMutations();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState<Partial<Vocabulary>>({
    bangla: "",
    english: "",
    partOfSpeech: "",
    pronunciation: "",
    explanation: "",
    synonyms: [],
    antonyms: [],
    examples: [],
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }

    if (id) {
      fetchVocabulary();
    }
  }, [user, isAdmin, id, navigate]);

  const fetchVocabulary = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const docRef = doc(db, "vocabularies", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data() as Vocabulary);
      } else {
        toast.error("Vocabulary not found");
        navigate("/vocabularies");
      }
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      toast.error("Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.english) {
      toast.error("Please enter a word first");
      return;
    }

    try {
      setGenerating(true);
      const details = await generateVocabularyFromWord(formData.english);
      setFormData((prev) => ({
        ...prev,
        ...details,
        english: formData.english, // Keep original word input
      }));
      toast.success("Details generated successfully");
    } catch (error) {
      console.error("Error generating details:", error);
      toast.error("Failed to generate details");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.english || !formData.bangla) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        userId: user!.uid,
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        await updateVocabulary.mutateAsync({ id, ...data });
        toast.success("Vocabulary updated successfully");
      } else {
        await addVocabulary.mutateAsync({
          ...data,
          createdAt: new Date().toISOString(),
        } as Omit<Vocabulary, "id">);
        toast.success("Vocabulary added successfully");
      }
      navigate("/vocabularies");
    } catch (error) {
      console.error("Error saving vocabulary:", error);
      toast.error("Failed to save vocabulary");
    } finally {
      setLoading(false);
    }
  };

  const addExample = () => {
    setFormData((prev) => ({
      ...prev,
      examples: [...(prev.examples || []), { bn: "", en: "" }],
    }));
  };

  const removeExample = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.filter((_, i) => i !== index),
    }));
  };

  const updateExample = (index: number, field: keyof VocabularyExample, value: string) => {
    setFormData((prev) => ({
      ...prev,
      examples: prev.examples?.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      ),
    }));
  };

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
      >
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold mb-1">
            {id ? "Edit Vocabulary" : "Add Vocabulary"}
          </h1>
          <p className="text-primary-foreground/80 text-sm">
            {id ? "Update existing word details" : "Add a new word to the collection"}
          </p>
        </div>
      </motion.header>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-hover">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Word Input & AI Generation */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="english">English</Label>
                  <Input
                    id="english"
                    value={formData.english}
                    onChange={(e) =>
                      setFormData({ ...formData, english: e.target.value })
                    }
                    placeholder="e.g. Serendipity"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={generating || !formData.english}
                  className="mb-[2px]"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Chatgpt Auto-fill
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bangla">Bangla Meaning</Label>
                  <Input
                    id="bangla"
                    value={formData.bangla}
                    onChange={(e) =>
                      setFormData({ ...formData, bangla: e.target.value })
                    }
                    placeholder="e.g. আকস্মিক প্রাপ্তি"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partOfSpeech">Part of Speech</Label>
                  <Select
                    value={formData.partOfSpeech}
                    onValueChange={(value) =>
                      setFormData({ ...formData, partOfSpeech: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PARTS_OF_SPEECH.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pronunciation">Pronunciation</Label>
                  <Input
                    id="pronunciation"
                    value={formData.pronunciation}
                    onChange={(e) =>
                      setFormData({ ...formData, pronunciation: e.target.value })
                    }
                    placeholder="e.g. /ˌser.ənˈdɪp.ə.ti/"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Detailed Explanation</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  placeholder="Explain the word usage and context..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Synonyms & Antonyms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="synonyms">Synonyms (comma separated)</Label>
                  <Input
                    id="synonyms"
                    value={formData.synonyms?.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        synonyms: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="luck, chance, fortune"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="antonyms">Antonyms (comma separated)</Label>
                  <Input
                    id="antonyms"
                    value={formData.antonyms?.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        antonyms: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="misfortune, bad luck"
                  />
                </div>
              </div>

              {/* Examples Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Examples</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExample}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Example
                  </Button>
                </div>
                {formData.examples?.map((example, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-lg bg-muted/30 relative group">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExample(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid gap-2">
                      <Label className="text-xs text-muted-foreground">English Sentence</Label>
                      <Input
                        value={example.en}
                        onChange={(e) => updateExample(index, "en", e.target.value)}
                        placeholder="Example sentence in English"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-xs text-muted-foreground">Bangla Translation</Label>
                      <Input
                        value={example.bn}
                        onChange={(e) => updateExample(index, "bn", e.target.value)}
                        placeholder="Example sentence in Bangla"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/vocabularies")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {id ? "Update Vocabulary" : "Add Vocabulary"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
