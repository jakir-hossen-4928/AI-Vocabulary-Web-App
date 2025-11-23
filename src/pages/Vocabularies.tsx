import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { VocabCard } from "@/components/VocabCard";
import { Vocabulary } from "@/types/vocabulary";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Vocabularies() {
  const [searchParams] = useSearchParams();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [filteredVocabs, setFilteredVocabs] = useState<Vocabulary[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchVocabularies();
  }, [user, navigate]);

  useEffect(() => {
    filterVocabularies();
  }, [searchQuery, vocabularies]);

  const fetchVocabularies = async () => {
    try {
      setLoading(true);
      const vocabQuery = query(
        collection(db, "vocabularies"),
        where("userId", "==", user?.uid),
        orderBy("createdAt", "desc")
      );
      
      const snapshot = await getDocs(vocabQuery);
      const vocabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vocabulary[];
      
      setVocabularies(vocabs);
    } catch (error: any) {
      console.error("Error fetching vocabularies:", error);
      toast.error("Failed to load vocabularies");
    } finally {
      setLoading(false);
    }
  };

  const filterVocabularies = () => {
    if (!searchQuery.trim()) {
      setFilteredVocabs(vocabularies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = vocabularies.filter(
      (v) =>
        v.bangla.toLowerCase().includes(query) ||
        v.english.toLowerCase().includes(query) ||
        v.partOfSpeech.toLowerCase().includes(query)
    );
    setFilteredVocabs(filtered);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Vocabularies</h1>
              <p className="text-primary-foreground/80 text-sm">
                {filteredVocabs.length} words in your collection
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => navigate("/vocabularies/add")}
                size="icon"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search words..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
            />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredVocabs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No vocabularies found" : "No vocabularies yet"}
            </p>
            {isAdmin && !searchQuery && (
              <Button onClick={() => navigate("/vocabularies/add")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Word
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVocabs.map((vocab) => (
              <VocabCard
                key={vocab.id}
                vocab={vocab}
                onClick={() => navigate(`/vocabularies/${vocab.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
