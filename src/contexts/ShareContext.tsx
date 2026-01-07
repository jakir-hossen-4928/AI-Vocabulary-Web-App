import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Vocabulary } from '@/types/vocabulary';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';

interface ShareContextType {
    shareAsImage: (item: Vocabulary) => Promise<void>;
    sharingId: string | null;
    itemToShare: Vocabulary | null;
    shareRef: React.RefObject<HTMLDivElement>;
}

const ShareContext = createContext<ShareContextType | undefined>(undefined);

// Import at component level to avoid circular dependency
let trackEventFn: ((eventName: string, additionalData?: Record<string, any>) => void) | null = null;

export const ShareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const shareRef = useRef<HTMLDivElement>(null);
    const [sharingId, setSharingId] = useState<string | null>(null);
    const [itemToShare, setItemToShare] = useState<Vocabulary | null>(null);

    // Try to get UTM tracking function
    try {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { trackEvent } = require('@/contexts/UTMContext').useUTM();
        trackEventFn = trackEvent;
    } catch {
        // UTM context not available, tracking will be skipped
    }

    const shareAsImage = useCallback(async (item: Vocabulary) => {
        if (sharingId) return;

        // Track share modal open
        trackEventFn?.('share_modal_open', {
            vocabulary_id: item.id,
            vocabulary_english: item.english,
            vocabulary_bangla: item.bangla
        });

        setItemToShare(item);
        setSharingId(item.id);

        // Wait for state update and render
        setTimeout(async () => {
            try {
                if (!shareRef.current) {
                    throw new Error('Capture element not found');
                }

                // Small delay to ensure render is settled and fonts are loaded
                await new Promise(resolve => setTimeout(resolve, 500));

                const dataUrl = await toPng(shareRef.current, {
                    cacheBust: true,
                    pixelRatio: 2,
                    skipAutoScale: true,
                    fontEmbedCSS: '',
                });

                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], `vocabulary-${item.english.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        files: [file],
                        title: `Vocabulary: ${item.english}`,
                        text: `Check out this word: ${item.english} (${item.bangla})`,
                    });

                    // Track successful share
                    trackEventFn?.('share_completed', {
                        vocabulary_id: item.id,
                        share_method: 'native_share'
                    });
                } else {
                    const link = document.createElement('a');
                    link.download = `vocabulary-${item.english.toLowerCase().replace(/\s+/g, '-')}.png`;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success('Sharing not supported. Image downloaded instead.');

                    // Track download fallback
                    trackEventFn?.('share_completed', {
                        vocabulary_id: item.id,
                        share_method: 'download'
                    });
                }
            } catch (error) {
                console.error('Error sharing image:', error);
                toast.error('Failed to generate sharing image. Please try again.');

                // Track share error
                trackEventFn?.('share_error', {
                    vocabulary_id: item.id,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            } finally {
                setSharingId(null);
                setItemToShare(null);
            }
        }, 150);
    }, [sharingId]);

    return (
        <ShareContext.Provider value={{ shareAsImage, sharingId, itemToShare, shareRef }}>
            {children}
        </ShareContext.Provider>
    );
};

export const useShare = () => {
    const context = useContext(ShareContext);
    if (context === undefined) {
        throw new Error('useShare must be used within a ShareProvider');
    }
    return context;
};
