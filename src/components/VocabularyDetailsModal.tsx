import { Vocabulary } from "@/types/vocabulary";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Volume2, Calendar, User, BookOpen, MessageSquare } from "lucide-react";
import { speakText } from "@/services/ttsService";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VocabularyDetailsModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function VocabularyDetailsModal({
    vocabulary,
    open,
    onOpenChange,
}: VocabularyDetailsModalProps) {
    if (!vocabulary) return null;

    const handleSpeak = () => {
        speakText(vocabulary.english);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <DialogHeader className="mb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <DialogTitle className="text-2xl sm:text-3xl mb-2">
                                        {vocabulary.bangla}
                                    </DialogTitle>
                                    <DialogDescription className="text-lg sm:text-xl font-medium text-primary">
                                        {vocabulary.english}
                                    </DialogDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleSpeak}
                                    className="flex-shrink-0"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Part of Speech & Pronunciation */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    {vocabulary.partOfSpeech}
                                </Badge>
                                {vocabulary.pronunciation && (
                                    <Badge variant="outline" className="text-sm">
                                        {vocabulary.pronunciation}
                                    </Badge>
                                )}
                            </div>

                            <Separator />

                            {/* Explanation */}
                            {vocabulary.explanation && (
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Explanation
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {vocabulary.explanation}
                                    </p>
                                </div>
                            )}

                            {/* Examples */}
                            {vocabulary.examples && vocabulary.examples.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        Examples ({vocabulary.examples.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {vocabulary.examples.map((example, index) => (
                                            <Card key={index} className="p-3 bg-muted/30">
                                                <p className="text-sm mb-1">{example.en}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {example.bn}
                                                </p>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Synonyms */}
                            {vocabulary.synonyms && vocabulary.synonyms.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Synonyms ({vocabulary.synonyms.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vocabulary.synonyms.map((synonym, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {synonym}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Antonyms */}
                            {vocabulary.antonyms && vocabulary.antonyms.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Antonyms ({vocabulary.antonyms.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {vocabulary.antonyms.map((antonym, index) => (
                                            <Badge key={index} variant="outline" className="text-sm">
                                                {antonym}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Metadata */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Created: {new Date(vocabulary.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        Updated: {new Date(vocabulary.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <User className="h-3 w-3" />
                                    <span className="truncate">ID: {vocabulary.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
