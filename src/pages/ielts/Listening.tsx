import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useState } from "react";

export default function Listening() {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="min-h-screen bg-background p-6 pb-24 md:pb-6">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Listening Practice</h1>
                    <p className="text-muted-foreground">
                        Section 1: Conversation between two students
                    </p>
                </header>

                <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                            <Volume2 className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="h-2 bg-primary/20 rounded-full mb-2">
                                <div className="h-full w-1/3 bg-primary rounded-full" />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>02:15</span>
                                <span>06:30</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 mt-6">
                        <Button variant="ghost" size="icon">
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button
                            size="icon"
                            className="h-12 w-12 rounded-full"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                        <Button variant="ghost" size="icon">
                            <SkipForward className="h-6 w-6" />
                        </Button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="font-semibold mb-4">Questions 1-10</h2>
                    <p className="text-sm text-muted-foreground mb-6">Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.</p>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-primary">Library Registration Form</h3>

                            <div className="grid gap-4 pl-4 border-l-2 border-muted">
                                <div className="grid grid-cols-[1fr,2fr] items-center gap-4">
                                    <span className="text-sm font-medium">Name:</span>
                                    <div className="flex items-center gap-2">
                                        <span>Sarah</span>
                                        <input type="text" className="border-b border-muted-foreground/30 bg-transparent px-2 py-1 focus:outline-none focus:border-primary w-32" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-[1fr,2fr] items-center gap-4">
                                    <span className="text-sm font-medium">Address:</span>
                                    <div className="flex items-center gap-2">
                                        <input type="text" className="border-b border-muted-foreground/30 bg-transparent px-2 py-1 focus:outline-none focus:border-primary w-12" />
                                        <span>Flat 4,</span>
                                        <input type="text" className="border-b border-muted-foreground/30 bg-transparent px-2 py-1 focus:outline-none focus:border-primary w-32" />
                                        <span>Road</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-[1fr,2fr] items-center gap-4">
                                    <span className="text-sm font-medium">Postcode:</span>
                                    <input type="text" className="border-b border-muted-foreground/30 bg-transparent px-2 py-1 focus:outline-none focus:border-primary w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
