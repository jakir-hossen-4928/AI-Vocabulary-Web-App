import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/BottomNav";
import { VocabCard } from "@/components/VocabCard";
import { Heart, Loader2, Download } from "lucide-react";
import { useVocabularies } from "@/hooks/useVocabularies";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generateFavoritesPDF } from "@/lib/pdf/generateFavoritesPdf";
import { motion } from "framer-motion";

export default function Favorites() {
  const { data: vocabularies = [], isLoading } = useVocabularies();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    const savedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(savedFavorites);
  }, [user, navigate]);

  const favoriteVocabs = vocabularies.filter(v => favorites.includes(v.id));

  const handleExport = async () => {
    if (favoriteVocabs.length === 0) {
      toast.error("No favorites to export");
      return;
    }

    setExporting(true);
    try {
      await generateFavoritesPDF({
        vocabularies: favoriteVocabs,
        userName: user?.displayName || "User",
        userEmail: user?.email || "",
      });
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground px-4 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6"
      >
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Favorites</h1>
            <p className="text-destructive-foreground/80 text-sm">
              {favoriteVocabs.length} favorite words
            </p>
          </div>
          {favoriteVocabs.length > 0 && (
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="secondary"
              size="sm"
              className="shadow-md"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </>
              )}
            </Button>
          )}
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : favoriteVocabs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Tap the heart icon on any vocabulary card to add it to your collection.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favoriteVocabs.map((vocab, index) => (
              <VocabCard
                key={vocab.id}
                vocab={vocab}
                index={index}
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
