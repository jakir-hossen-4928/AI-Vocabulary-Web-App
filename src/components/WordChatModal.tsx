import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WordChat } from "@/components/WordChat";
import { Vocabulary } from "@/types/vocabulary";
import { cn } from "@/lib/utils";

interface WordChatModalProps {
    vocabulary: Vocabulary | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialPrompt?: string;
}

export function WordChatModal({ vocabulary, open, onOpenChange, initialPrompt }: WordChatModalProps) {
    if (!vocabulary) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "flex flex-col p-0 bg-background border shadow-lg",
                // Mobile: full screen with safe area insets (though we prefer routing for mobile now, this is a fallback)
                "w-[100vw] h-[100vh] max-w-none max-h-none rounded-none",
                // Tablet: slightly smaller
                "md:w-[95vw] md:h-[95vh] md:rounded-xl",
                // Desktop: fixed size
                "lg:w-[80vw] lg:max-w-[900px] lg:h-[85vh]",
                // Large desktop
                "xl:w-[70vw] xl:max-w-[1000px]",
                // Positioning
                "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                // Safe area for mobile devices
                "safe-area-inset-bottom safe-area-inset-top"
            )}>
                {/* We hide the default DialogHeader because WordChat has its own header */}
                <DialogHeader className="sr-only">
                    <DialogTitle>Chat with {vocabulary.english}</DialogTitle>
                    <DialogDescription>
                        AI Chat interface for {vocabulary.english}
                    </DialogDescription>
                </DialogHeader>

                <WordChat
                    vocabulary={vocabulary}
                    onClose={() => onOpenChange(false)}
                    initialPrompt={initialPrompt}
                    isPageMode={false}
                />
            </DialogContent>
        </Dialog>
    );
}