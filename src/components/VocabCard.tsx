import { Volume2, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vocabulary } from "@/types/vocabulary";
import { speakText } from "@/services/ttsService";
import { useState, useEffect } from "react";

import { motion } from "framer-motion";

interface VocabCardProps {
  vocab: Vocabulary;
  onClick?: () => void;
  index?: number;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const VocabCard = ({ vocab, onClick, index = 0, onDelete, isAdmin = false }: VocabCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(vocab.id));
  }, [vocab.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavorites = isFavorite
      ? favorites.filter((id: string) => id !== vocab.id)
      : [...favorites, vocab.id];
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakText(vocab.english);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm(`Are you sure you want to delete "${vocab.english}"?`)) {
      onDelete(vocab.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-4 cursor-pointer hover:shadow-hover transition-all duration-300 bg-vocab-card hover:bg-vocab-card-hover"
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-foreground">{vocab.bangla}</h3>
              <Badge variant="secondary" className="text-xs">
                {vocab.partOfSpeech}
              </Badge>
            </div>
            <p className="text-lg text-primary font-medium">{vocab.english}</p>
            <p className="text-sm text-muted-foreground mt-1">{vocab.pronunciation}</p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className="h-8 w-8"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
              className="h-8 w-8"
            >
              <Heart
                className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
              />
            </Button>
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {vocab.explanation && (
          <p className="text-sm text-muted-foreground">
            {vocab.explanation}
          </p>
        )}
      </Card>
    </motion.div>
  );
};
