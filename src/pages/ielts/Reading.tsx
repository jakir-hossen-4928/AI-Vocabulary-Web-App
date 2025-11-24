import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Clock } from "lucide-react";

export default function Reading() {
    return (
        <div className="min-h-screen bg-background p-6 pb-24 md:pb-6">
            <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex flex-col">
                <header className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Reading Passage 1</h1>
                        <p className="text-muted-foreground">The History of Tea</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full font-mono">
                        <Clock className="h-4 w-4" />
                        <span>19:45</span>
                    </div>
                </header>

                <div className="grid md:grid-cols-2 gap-6 flex-1 min-h-0">
                    {/* Passage */}
                    <Card className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-6">
                            <article className="prose dark:prose-invert max-w-none">
                                <p>
                                    The story of tea begins in China. According to legend, in 2737 BC, the Chinese emperor Shen Nung was sitting beneath a tree while his servant boiled drinking water, when some leaves from the tree blew into the water. Shen Nung, a renowned herbalist, decided to try the infusion that his servant had accidentally created. The tree was a Camellia sinensis, and the resulting drink was what we now call tea.
                                </p>
                                <p>
                                    It is impossible to know whether there is any truth in this story. But tea drinking certainly became established in China many centuries before it had even been heard of in the west. Containers for tea have been found in tombs dating from the Han dynasty (206 BC - 220 AD) but it was under the Tang dynasty (618-906 AD), that tea became firmly established as the national drink of China.
                                </p>
                                <p>
                                    It became such a favourite that during the late eighth century a writer called Lu Yu wrote the first book entirely about tea, the Ch'a Ching, or Tea Classic. It was shortly after this that tea was first introduced to Japan, by Japanese Buddhist monks who had travelled to China to study.
                                </p>
                                {/* Add more paragraphs as needed */}
                            </article>
                        </ScrollArea>
                    </Card>

                    {/* Questions */}
                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-muted/30">
                            <h2 className="font-semibold">Questions 1-5</h2>
                            <p className="text-sm text-muted-foreground">Choose the correct letter, A, B, C or D.</p>
                        </div>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-8">
                                {[1, 2, 3, 4, 5].map((q) => (
                                    <div key={q} className="space-y-3">
                                        <p className="font-medium">{q}. According to the legend, who discovered tea?</p>
                                        <div className="space-y-2">
                                            {["A servant", "Shen Nung", "Lu Yu", "A Buddhist monk"].map((opt, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <input type="radio" name={`q${q}`} id={`q${q}-${i}`} className="w-4 h-4" />
                                                    <label htmlFor={`q${q}-${i}`} className="text-sm">{opt}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t">
                            <Button className="w-full">Submit Answers</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
