import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { generateVocabularyContent } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const partsOfSpeech = [
  "noun", "verb", "adjective", "adverb", 
  "pronoun", "preposition", "conjunction", "interjection"
];

export default function AddVocabulary() {
  const [bangla, setBangla] = useState("");
  const [english, setEnglish] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin) {
      toast.error("Admin access required");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const handleGenerate = async () => {
    if (!bangla.trim() || !english.trim() || !partOfSpeech) {
      toast.error("Please fill in Bangla word, English meaning, and part of speech");
      return;
    }

    const apiKey = localStorage.getItem("googleAIKey");
    if (!apiKey) {
      toast.error("Please add your Google AI Studio API key in Profile settings");
      navigate("/profile");
      return;
    }

    setGenerating(true);
    try {
      const aiContent = await generateVocabularyContent(
        bangla,
        english,
        partOfSpeech,
        apiKey
      );

      const vocabData = {
        bangla: bangla.trim(),
        english: english.trim(),
        partOfSpeech,
        pronunciation: aiContent.pronunciation || "",
        examples: aiContent.examples || [],
        synonyms: aiContent.synonyms || [],
        antonyms: aiContent.antonyms || [],
        explanation: aiContent.explanation || "",
        userId: user!.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSaving(true);
      await addDoc(collection(db, "vocabularies"), vocabData);
      
      toast.success("Vocabulary added successfully!");
      navigate("/vocabularies");
    } catch (error: any) {
      console.error("Error generating vocabulary:", error);
      toast.error(error.message || "Failed to generate vocabulary");
    } finally {
      setGenerating(false);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4 text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold mb-1">Add Vocabulary</h1>
          <p className="text-primary-foreground/80 text-sm">
            AI will generate examples and details
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        <Card className="p-6 shadow-hover">
          <div className="space-y-4">
            <div>
              <Label htmlFor="bangla">Bangla Word *</Label>
              <Input
                id="bangla"
                placeholder="জ্ঞান"
                value={bangla}
                onChange={(e) => setBangla(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <Label htmlFor="english">English Meaning *</Label>
              <Input
                id="english"
                placeholder="knowledge"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <Label htmlFor="pos">Part of Speech *</Label>
              <Select value={partOfSpeech} onValueChange={setPartOfSpeech}>
                <SelectTrigger id="pos">
                  <SelectValue placeholder="Select part of speech" />
                </SelectTrigger>
                <SelectContent>
                  {partsOfSpeech.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generating || saving}
              className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
              size="lg"
            >
              {generating || saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {generating ? "Generating with AI..." : "Saving..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate & Save
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              AI will generate pronunciation, examples, synonyms, antonyms, and explanation
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
