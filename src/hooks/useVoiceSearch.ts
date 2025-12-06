import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
    length: number;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionConstructor {
    new(): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    start: () => void;
    stop: () => void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionConstructor;
        webkitSpeechRecognition: SpeechRecognitionConstructor;
    }
}

type SupportedLanguage = 'en-US' | 'bn-BD';

export function useVoiceSearch(onResult: (transcript: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [language, setLanguage] = useState<SupportedLanguage>('en-US');
    const [interimTranscript, setInterimTranscript] = useState<string>('');

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const toastIdRef = useRef<string | number | null>(null);
    const hasFinalRef = useRef(false);

    const toggleLanguage = useCallback(() => {
        setLanguage(prev => prev === 'en-US' ? 'bn-BD' : 'en-US');
    }, []);

    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            toast.error("🎤 Voice search not supported", {
                description: "Please use Chrome, Edge, or Brave browser"
            });
            return;
        }

        // Reset state
        hasFinalRef.current = false;
        setInterimTranscript('');
        setIsListening(true);

        const langLabel = language === 'en-US' ? 'English' : 'Bangla';
        const langFlag = language === 'en-US' ? '🇺🇸' : '🇧🇩';

        // Show listening toast
        toastIdRef.current = toast.loading(`🎤 Listening (${langLabel})...`, {
            description: "Speak clearly"
        });

        // Create recognizer for selected language ONLY
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.interimResults = true;
        recognition.continuous = false; // Stop after first result

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const result = event.results[0];
            const transcript = result[0].transcript;
            const isFinal = result.isFinal;

            if (!isFinal) {
                setInterimTranscript(transcript);
                if (toastIdRef.current) {
                    toast.loading(`🎤 ${langLabel}: "${transcript}"`, {
                        id: toastIdRef.current,
                        description: "Keep speaking..."
                    });
                }
            } else {
                hasFinalRef.current = true;
                setInterimTranscript('');
                setIsListening(false);

                console.log(`✅ Recognized (${langLabel}): "${transcript}"`);

                if (toastIdRef.current) {
                    toast.dismiss(toastIdRef.current);
                }

                onResult(transcript);
                toast.success(`${langFlag} Detected`, {
                    description: `"${transcript}"`,
                    duration: 3000
                });
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'aborted') return;
            if (event.error === 'no-speech' && hasFinalRef.current) return;

            console.error("Speech recognition error", event.error);
            setIsListening(false);
            setInterimTranscript('');

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }

            if (event.error === 'no-speech') {
                toast.error("No speech detected", {
                    description: "Please try again"
                });
            } else if (event.error === 'not-allowed') {
                toast.error("Microphone denied", {
                    description: "Please allow access"
                });
            } else {
                toast.error("Recognition failed");
            }
        };

        recognition.onend = () => {
            if (!hasFinalRef.current) {
                setIsListening(false);
                setInterimTranscript('');
                if (toastIdRef.current) toast.dismiss(toastIdRef.current);
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start", e);
            setIsListening(false);
        }

    }, [language, onResult]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) { }
        }
        setIsListening(false);
        setInterimTranscript('');
        if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    }, []);

    return {
        isListening,
        startListening,
        stopListening,
        detectedLanguage: language === 'en-US' ? 'English' : 'Bangla', // backwards compatibility
        interimTranscript,
        language,
        toggleLanguage
    };
}
