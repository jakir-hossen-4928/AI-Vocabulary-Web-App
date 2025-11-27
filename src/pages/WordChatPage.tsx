import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useVocabularies } from "@/hooks/useVocabularies";
import { WordChat } from "@/components/WordChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Vocabulary } from "@/types/vocabulary";

export default function WordChatPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: vocabularies, isLoading } = useVocabularies();
    const [vocabulary, setVocabulary] = useState<Vocabulary | null>(null);

    // Get initial prompt from navigation state
    const initialPrompt = location.state?.initialPrompt as string | undefined;

    useEffect(() => {
        if (vocabularies && id) {
            const found = vocabularies.find(v => v.id === id);
            if (found) {
                setVocabulary(found);
            } else if (!isLoading) {
                // Not found
                navigate("/home");
            }
        }
    }, [vocabularies, id, isLoading, navigate]);

    if (isLoading || !vocabulary) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background safe-area-inset-bottom safe-area-inset-top">
            <WordChat
                vocabulary={vocabulary}
                onClose={() => navigate(-1)}
                initialPrompt={initialPrompt}
                isPageMode={true}
            />
        </div>
    );
}
