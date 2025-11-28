import React, { useState } from 'react';
import './TranslateButton.css';
import { Loader2, Languages } from "lucide-react";

interface TranslateButtonProps {
    text: string;
    className?: string;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({ text, className = "" }) => {
    const [isTranslating, setIsTranslating] = useState(false);
    const [translatedText, setTranslatedText] = useState('');
    const [showTranslation, setShowTranslation] = useState(false);

    const translateToBangla = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent clicks
        if (showTranslation) {
            setShowTranslation(false);
            return;
        }

        if (translatedText) {
            setShowTranslation(true);
            return;
        }

        setIsTranslating(true);

        try {
            const response = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(text)}`
            );
            const data = await response.json();
            // data[0] is an array of sentences. We need to join them if there are multiple.
            const translation = data[0].map((item: any) => item[0]).join('');
            setTranslatedText(translation);
            setShowTranslation(true);
        } catch (error) {
            console.error('Translation error:', error);
            setTranslatedText('Translation failed. Please try again.');
            setShowTranslation(true);
        } finally {
            setIsTranslating(false);
        }
    };

    return (
        <div className={`translate-wrapper ${className}`} onClick={(e) => e.stopPropagation()}>
            <button
                className={`translate-trigger-btn ${showTranslation ? 'active' : ''}`}
                onClick={translateToBangla}
                disabled={isTranslating}
                title="Translate to Bangla"
            >
                {isTranslating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <>
                        <Languages className="h-3 w-3" />
                        <span className="flag-icon">🇧🇩</span>

                    </>
                )}
            </button>

            {showTranslation && (
                <div className="translation-card">
                    <div className="translation-header">
                        <span className="lang-label">🇧🇩 বাংলা অনুবাদ</span>
                        <button
                            className="close-icon-btn"
                            onClick={() => setShowTranslation(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="translation-body">
                        {translatedText}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TranslateButton;
