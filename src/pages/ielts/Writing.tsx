import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Writing() {
    const [text, setText] = useState("");
    const [feedback, setFeedback] = useState<null | { score: number; comments: string[] }>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const handleAnalyze = () => {
        setAnalyzing(true);
        // Simulate analysis
        setTimeout(() => {
            setFeedback({
                score: 7.5,
                comments: [
                    "Good use of vocabulary.",
                    "Try to vary your sentence structure more.",
                    "Excellent coherence in the second paragraph."
                ]
            });
            setAnalyzing(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-background p-6 pb-24 md:pb-6">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <header>
                        <h1 className="text-3xl font-bold mb-2">Writing Task 2</h1>
                        <p className="text-muted-foreground">
                            Some people believe that technology has made our lives too complex. Others feel it has made life easier. Discuss both views and give your opinion.
                        </p>
                    </header>

                    <Card className="p-4">
                        <Textarea
                            placeholder="Start writing your essay here..."
                            className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed p-0"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-muted-foreground">
                            <span>{wordCount} words</span>
                            <Button onClick={handleAnalyze} disabled={analyzing || wordCount < 10}>
                                {analyzing ? "Analyzing..." : "Get Feedback"}
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {feedback ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className="p-6 bg-primary/5 border-primary/20">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">AI Feedback</h2>
                                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold">
                                        Band {feedback.score}
                                    </div>
                                </div>
                                <ul className="space-y-3">
                                    {feedback.comments.map((comment, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                            <span>{comment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>
                    ) : (
                        <Card className="p-6 h-full flex flex-col items-center justify-center text-center text-muted-foreground border-dashed">
                            <PenTool className="h-12 w-12 mb-4 opacity-20" />
                            <p>Write your essay and click "Get Feedback" to see AI analysis.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
