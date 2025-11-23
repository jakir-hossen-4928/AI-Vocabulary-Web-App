import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { VocabCard } from "@/components/VocabCard";
import { Vocabulary } from "@/types/vocabulary";
import { Heart, Loader2 } from "lucide-react";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFavorites();
  }, [user, navigate]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const vocabQuery = query(
        collection(db, "vocabularies"),
        where("userId", "==", user?.uid)
      );
      
      const snapshot = await getDocs(vocabQuery);
      const allVocabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vocabulary[];
      
      const favVocabs = allVocabs.filter(v => favoriteIds.includes(v.id));
      setFavorites(favVocabs);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Favorites</h1>
          <p className="text-destructive-foreground/80 text-sm">
            {favorites.length} favorite words
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No favorite words yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Tap the heart icon on any vocabulary card to add it here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((vocab) => (
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
