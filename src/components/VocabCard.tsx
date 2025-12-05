import { Volume2, Heart, Trash2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vocabulary } from "@/types/vocabulary";
import { speakText } from "@/services/ttsService";
import { memo, useState } from "react";

interface VocabCardProps {
  vocab: Vocabulary;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick?: () => void;
  index?: number;
  onDelete?: (id: string) => void;
  onImproveMeaning?: (id: string) => Promise<void>;
  isAdmin?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// Helper function to determine text size based on length
const getBanglaTextSize = (text: string) => {
  const length = text.length;
  if (length > 50) return "text-sm sm:text-base md:text-lg";
  if (length > 30) return "text-base sm:text-lg md:text-xl";
  return "text-base sm:text-xl md:text-2xl";
};

const getEnglishTextSize = (text: string) => {
  const length = text.length;
  if (length > 50) return "text-xs sm:text-sm md:text-base";
  if (length > 30) return "text-sm sm:text-base md:text-lg";
  return "text-sm sm:text-lg md:text-xl";
};

export const VocabCard = memo(({
  vocab,
  isFavorite,
  onToggleFavorite,
  onClick,
  onDelete,
  onImproveMeaning,
  isAdmin = false,
  style,
  className
}: VocabCardProps) => {
  const [isImproving, setIsImproving] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(vocab.id);
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

  const handleImprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImproveMeaning) {
      setIsImproving(true);
      try {
        await onImproveMeaning(vocab.id);
      } catch (error) {
        console.error("Failed to improve meaning:", error);
      } finally {
        setIsImproving(false);
      }
    }
  };

  const banglaTextSize = getBanglaTextSize(vocab.bangla);
  const englishTextSize = getEnglishTextSize(vocab.english);

  return (
    <div
      style={style}
      className={className}
    >
      <Card
        className="p-3 sm:p-4 md:p-5 cursor-pointer hover:shadow-hover transition-all duration-300 bg-vocab-card hover:bg-vocab-card-hover h-full flex flex-col justify-between"
        onClick={onClick}
      >
        <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-start sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-1.5 flex-wrap">
              <h3 className={`${banglaTextSize} font-bold text-foreground break-words leading-tight`}>
                {vocab.bangla}
              </h3>
              {onImproveMeaning && !vocab.isOnline && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 sm:h-6 sm:w-6 -ml-0.5 text-muted-foreground flex-shrink-0"
                  onClick={handleImprove}
                  disabled={isImproving}
                  title="Chat with AI for improved meaning"
                >
                  {isImproving ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}
              <Badge variant="secondary" className="text-[9px] sm:text-[10px] md:text-xs flex-shrink-0 px-1.5 sm:px-2 py-0.5">
                {vocab.partOfSpeech}
              </Badge>
            </div>
            <p className={`${englishTextSize} text-primary font-medium break-words leading-snug`}>
              {vocab.english}
            </p>
            {vocab.pronunciation && (
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 break-words leading-tight">
                {vocab.pronunciation}
              </p>
            )}
          </div>
          <div className="flex gap-0.5 sm:gap-1 flex-shrink-0 flex-col sm:flex-row">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className="h-7 w-7 sm:h-8 sm:w-8"
              title="Speak"
            >
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            {!vocab.isOnline && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                className="h-7 w-7 sm:h-8 sm:w-8"
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`}
                />
              </Button>
            )}
            {isAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>

        {vocab.explanation && (
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 break-words mt-auto leading-relaxed">
            {vocab.explanation}
          </p>
        )}
      </Card>
    </div>
  );
});

VocabCard.displayName = "VocabCard";
