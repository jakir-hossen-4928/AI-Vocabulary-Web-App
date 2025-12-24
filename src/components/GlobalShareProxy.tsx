import React from 'react';
import { useShare } from '@/contexts/ShareContext';
import { ShareableVocabularyCard } from './ShareableVocabularyCard';

export const GlobalShareProxy: React.FC = () => {
    const { itemToShare, shareRef } = useShare();

    if (!itemToShare) return null;

    return (
        <div
            style={{
                position: 'fixed',
                left: '-9999px', // Position off-screen instead of opacity 0 for safety with some browsers
                top: '0',
                width: '450px',
                zIndex: -1,
                overflow: 'hidden',
                backgroundColor: 'white'
            }}
        >
            <ShareableVocabularyCard ref={shareRef} item={itemToShare} />
        </div>
    );
};
