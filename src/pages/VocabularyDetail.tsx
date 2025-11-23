import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Vocabulary } from "@/types/vocabulary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Volume2, Trash2, Heart, Loader2 } from "lucide-react";
import { speakText } from "@/services/ttsService";
import { toast } from "sonner";

export default function VocabularyDetail() {
  const { id } = useParams();
  const [vocab, setVocab] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVocabulary();
    checkFavorite();
  }, [id]);

  const fetchVocabulary = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const docRef = doc(db, "vocabularies", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setVocab({ id: docSnap.id, ...docSnap.data() } as Vocabulary);
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

  const checkFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(id));
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavorites = isFavorite
      ? favorites.filter((fid: string) => fid !== id)
      : [...favorites, id];
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const handleDelete = async () => {
    if (!id || !isAdmin) return;
    if (!confirm("Are you sure you want to delete this vocabulary?")) return;

    try {
      await deleteDoc(doc(db, "vocabularies", id));
      toast.success("Vocabulary deleted");
      navigate("/vocabularies");
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      toast.error("Failed to delete vocabulary");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vocab) return null;

  return (
    <div className="min-h-screen bg-background pb-8">
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFavorite}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  className="text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{vocab.bangla}</h1>
              <p className="text-xl mb-2">{vocab.english}</p>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                  {vocab.partOfSpeech}
                </Badge>
                <span className="text-sm text-primary-foreground/80">
                  {vocab.pronunciation}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => speakText(vocab.english)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Volume2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Explanation */}
        <Card className="p-6 shadow-hover">
          <h2 className="font-semibold text-foreground mb-2">Explanation</h2>
          <p className="text-muted-foreground">{vocab.explanation}</p>
        </Card>

        {/* Examples */}
        {vocab.examples && vocab.examples.length > 0 && (
          <Card className="p-6 shadow-card">
            <h2 className="font-semibold text-foreground mb-3">Examples</h2>
            <div className="space-y-4">
              {vocab.examples.map((example, idx) => (
                <div key={idx} className="border-l-2 border-accent pl-4">
                  <p className="text-foreground mb-1">{example.bn}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-sm flex-1">
                      {example.en}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => speakText(example.en)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-2 gap-4">
          {vocab.synonyms && vocab.synonyms.length > 0 && (
            <Card className="p-4 shadow-card">
              <h3 className="font-semibold text-sm text-foreground mb-2">
                Synonyms
              </h3>
              <div className="flex flex-wrap gap-1">
                {vocab.synonyms.map((syn, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {syn}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
          
          {vocab.antonyms && vocab.antonyms.length > 0 && (
            <Card className="p-4 shadow-card">
              <h3 className="font-semibold text-sm text-foreground mb-2">
                Antonyms
              </h3>
              <div className="flex flex-wrap gap-1">
                {vocab.antonyms.map((ant, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {ant}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
