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

export function useVoiceSearch(onResult: (transcript: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
    const [interimTranscript, setInterimTranscript] = useState<string>('');

    const enRecRef = useRef<SpeechRecognition | null>(null);
    const bnRecRef = useRef<SpeechRecognition | null>(null);
    const hasFinalRef = useRef(false);
    const toastIdRef = useRef<string | number | null>(null);

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
        setDetectedLanguage(null);
        setInterimTranscript('');
        setIsListening(true);

        // Show listening toast
        toastIdRef.current = toast.loading("🎤 Listening...", {
            description: "Speak in English or Bangla"
        });

        // Create English recognizer
        const enRec = new SpeechRecognition();
        enRec.lang = "en-US";
        enRec.interimResults = true; // Enable interim results for live feedback
        enRec.continuous = false;

        // Create Bangla recognizer
        const bnRec = new SpeechRecognition();
        bnRec.lang = "bn-BD";
        enRec.interimResults = true;
        bnRec.continuous = false;

        const handleResult = (lang: string, event: SpeechRecognitionEvent) => {
            if (hasFinalRef.current) return;

            const result = event.results[0];
            const transcript = result[0].transcript;
            const confidence = result[0].confidence;
            const isFinal = result.isFinal;

            // Update interim transcript for live feedback
            if (!isFinal) {
                setInterimTranscript(transcript);
                setDetectedLanguage(lang);

                // Update toast with interim result
                if (toastIdRef.current) {
                    toast.loading(`🎤 ${lang}: "${transcript}"`, {
                        id: toastIdRef.current,
                        description: "Keep speaking..."
                    });
                }
                return;
            }

            // Final result
            hasFinalRef.current = true;
            setDetectedLanguage(lang);
            setInterimTranscript('');

            console.log(`✅ Detected ${lang}: "${transcript}" (${(confidence * 100).toFixed(0)}% confidence)`);

            // Stop both recognizers
            try {
                enRec.stop();
                bnRec.stop();
            } catch (e) {
                // Ignore errors if already stopped
            }

            setIsListening(false);

            // Dismiss loading toast
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }

            // Call the callback with the transcript
            onResult(transcript);

            // Show success toast with language flag
            const flag = lang === 'English' ? '🇺🇸' : '🇧🇩';
            toast.success(`${flag} ${lang} detected`, {
                description: `"${transcript}"`,
                duration: 3000
            });
        };

        const handleError = (lang: string) => (event: any) => {
            // Ignore "aborted" errors - they're expected when one recognizer wins
            if (event.error === 'aborted') {
                return;
            }

            // Ignore "no-speech" if we already have a result
            if (event.error === 'no-speech' && hasFinalRef.current) {
                return;
            }

            console.error(`${lang} recognition error:`, event.error);

            // Only show error if both failed
            if (!hasFinalRef.current) {
                setTimeout(() => {
                    if (!hasFinalRef.current) {
                        setIsListening(false);
                        setInterimTranscript('');

                        if (toastIdRef.current) {
                            toast.dismiss(toastIdRef.current);
                        }

                        if (event.error === 'no-speech') {
                            toast.error("No speech detected", {
                                description: "Please try again and speak clearly"
                            });
                        } else if (event.error === 'not-allowed') {
                            toast.error("Microphone access denied", {
                                description: "Please allow microphone access in browser settings"
                            });
                        } else {
                            toast.error("Voice recognition failed", {
                                description: "Please try again"
                            });
                        }
                    }
                }, 1000);
            }
        };

        const handleEnd = () => {
            if (!hasFinalRef.current && !interimTranscript) {
                setTimeout(() => {
                    if (!hasFinalRef.current) {
                        setIsListening(false);
                        setInterimTranscript('');

                        if (toastIdRef.current) {
                            toast.dismiss(toastIdRef.current);
                        }

                        toast.info("No speech detected", {
                            description: "Click the mic and speak clearly"
                        });
                    }
                }, 500);
            }
        };

        // Set up event handlers
        enRec.onresult = (e) => handleResult("English", e);
        bnRec.onresult = (e) => handleResult("Bangla", e);

        enRec.onerror = handleError("English");
        bnRec.onerror = handleError("Bangla");

        enRec.onend = handleEnd;
        bnRec.onend = handleEnd;

        // Store refs
        enRecRef.current = enRec;
        bnRecRef.current = bnRec;

        // Start both recognizers
        try {
            enRec.start();
            bnRec.start();
        } catch (error) {
            console.error("Failed to start recognition:", error);
            setIsListening(false);

            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }

            toast.error("Failed to start voice recognition", {
                description: "Please check microphone permissions"
            });
        }
    }, [onResult, interimTranscript]);

    const stopListening = useCallback(() => {
        try {
            enRecRef.current?.stop();
            bnRecRef.current?.stop();
        } catch (e) {
            // Ignore errors
        }
        setIsListening(false);
        setInterimTranscript('');
        hasFinalRef.current = false;

        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }
    }, []);

    return {
        isListening,
        detectedLanguage,
        interimTranscript,
        startListening,
        stopListening,
    };
}
