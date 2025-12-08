import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Vocabulary } from "@/types/vocabulary";
import { Languages, Copy, Check, Loader2, RefreshCw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { translateText, TranslationResult } from "@/services/googleTranslateService";
import { speakText } from "@/services/ttsService";

interface GoogleTranslateModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GoogleTranslateModal({ vocabulary, open, onOpenChange }: GoogleTranslateModalProps) {
    const [copied, setCopied] = useState(false);
    const [translation, setTranslation] = useState<TranslationResult | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-translate when modal opens
    useEffect(() => {
        if (open && vocabulary) {
            handleTranslate();
        } else {
            // Reset state when modal closes
            setTranslation(null);
            setError(null);
            setCopied(false);
        }
    }, [open, vocabulary]);

    const handleTranslate = async () => {
        if (!vocabulary) return;

        setIsTranslating(true);
        setError(null);

        try {
            const text = vocabulary.english;
            const result = await translateText(text);
            setTranslation(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Translation failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy');
        }
    };

    const handleSpeak = (text: string) => {
        speakText(text);
    };

    if (!vocabulary) return null;

    const explanation = vocabulary.explanation || '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                            <Languages className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl">Google Translate</DialogTitle>
                            <DialogDescription className="mt-1">
                                Instant translation from English to Bangla
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    {/* Original Word Card */}
                    <Card className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white">
                                    English
                                </Badge>
                                <span className="text-xs text-muted-foreground">Original</span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSpeak(vocabulary.english)}
                                    className="h-8 w-8 p-0"
                                    title="Speak English"
                                >
                                    <Volume2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(vocabulary.english)}
                                    className="h-8 w-8 p-0"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-bold text-slate-900">{vocabulary.english}</h3>
                                <Badge variant="secondary" className="text-xs">
                                    {vocabulary.partOfSpeech}
                                </Badge>
                            </div>
                            {vocabulary.pronunciation && (
                                <p className="text-sm text-slate-600">
                                    /{vocabulary.pronunciation}/
                                </p>
                            )}
                            {explanation && (
                                <p className="text-sm text-slate-700 leading-relaxed pt-2 border-t border-slate-200">
                                    {explanation}
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Translation Result Card */}
                    <Card className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-white border-blue-300">
                                    বাংলা (Bangla)
                                </Badge>
                                <span className="text-xs text-blue-700">Translation</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleTranslate}
                                disabled={isTranslating}
                                className="h-8 gap-1.5 text-xs"
                                title="Retry translation"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                                Retry
                            </Button>
                        </div>

                        {isTranslating ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center space-y-3">
                                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                                    <p className="text-sm text-blue-700">Translating...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="py-6 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                                    <span className="text-2xl">⚠️</span>
                                </div>
                                <p className="text-sm text-red-700 mb-3">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleTranslate}
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try Again
                                </Button>
                            </div>
                        ) : translation ? (
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="text-2xl font-bold text-blue-900 leading-relaxed flex-1">
                                        {translation.translatedText}
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCopy(translation.translatedText)}
                                        className="h-8 w-8 p-0 flex-shrink-0"
                                    >
                                        {copied ? (
                                            <Check className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="pt-3 border-t border-blue-200">
                                    <p className="text-xs text-blue-600">
                                        ✓ Translation complete
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </Card>

                    {/* Examples if available */}
                    {vocabulary.examples && vocabulary.examples.length > 0 && (
                        <Card className="p-4 bg-amber-50 border-amber-200">
                            <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-2">
                                    <span>💡</span>
                                    Example Usage
                                </h4>
                                <div className="space-y-2">
                                    {vocabulary.examples.slice(0, 2).map((example, index) => (
                                        <div key={index} className="text-sm">
                                            <p className="text-amber-800 italic">"{example.en}"</p>
                                            {example.bn && (
                                                <p className="text-amber-700 mt-1">"{example.bn}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                        <Languages className="h-3.5 w-3.5" />
                        <span>Translation powered by Google Translate</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
