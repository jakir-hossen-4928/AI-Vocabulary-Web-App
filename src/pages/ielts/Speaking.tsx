import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function Speaking() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Placeholder for recording logic
        if (!isRecording) {
            setTranscript("Listening...");
            setTimeout(() => {
                setTranscript("This is a simulated transcript of your speech. In a real implementation, this would use the Web Speech API or a backend service.");
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 pb-24 md:pb-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Speaking Practice</h1>
                    <p className="text-muted-foreground">
                        Topic: Describe a memorable journey you have taken.
                    </p>
                </header>

                <Card className="p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                    {isRecording && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-rose-500/5 rounded-xl"
                        />
                    )}

                    <div className="z-10 text-center space-y-8">
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-rose-100' : 'bg-muted'}`}>
                            <Mic className={`h-12 w-12 ${isRecording ? 'text-rose-500' : 'text-muted-foreground'}`} />
                        </div>

                        <div className="space-y-4">
                            <Button
                                size="lg"
                                variant={isRecording ? "destructive" : "default"}
                                className="rounded-full px-8 h-12"
                                onClick={toggleRecording}
                            >
                                {isRecording ? (
                                    <>
                                        <Square className="mr-2 h-4 w-4 fill-current" /> Stop Recording
                                    </>
                                ) : (
                                    <>
                                        <Mic className="mr-2 h-4 w-4" /> Start Speaking
                                    </>
                                )}
                            </Button>
                        </div>

                        {transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-muted/50 p-4 rounded-lg max-w-md mx-auto text-sm text-muted-foreground"
                            >
                                {transcript}
                            </motion.div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
