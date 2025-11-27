import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, Loader2, User, DollarSign, Zap, Copy, Check, X, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Imports
import { chatWithVocabulary } from "@/services/openaiChatService";
import { OpenAIApiKeyManager } from "@/components/OpenAIApiKeyManager";
import {
    hasOpenAIApiKey,
    getChatSessionByVocabulary,
    saveChatSession,
    saveTokenUsage,
    getSelectedModel,
    ChatSession,
    ChatMessage
} from "@/lib/apiKeyStorage";
import { calculateCost, formatCost, getModelById, DEFAULT_MODEL } from "@/lib/openaiConfig";
import { Vocabulary } from "@/types/vocabulary";

interface WordChatProps {
    vocabulary: Vocabulary;
    onClose?: () => void;
    initialPrompt?: string;
    isPageMode?: boolean; // To adjust styling for full page vs modal
}

export function WordChat({ vocabulary, onClose, initialPrompt, isPageMode = false }: WordChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [needsApiKey, setNeedsApiKey] = useState(false);
    const [sessionStats, setSessionStats] = useState({ tokens: 0, cost: 0 });
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasProcessedInitialPrompt = useRef(false);

    // Check mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize chat
    useEffect(() => {
        if (vocabulary) {
            setNeedsApiKey(!hasOpenAIApiKey());

            // Load existing session or create welcome message
            const existingSession = getChatSessionByVocabulary(vocabulary.id);
            if (existingSession && existingSession.messages.length > 0) {
                setMessages(existingSession.messages);
                setSessionStats({
                    tokens: existingSession.totalTokens,
                    cost: existingSession.totalCost
                });
            } else {
                const welcomeMessage: ChatMessage = {
                    role: "assistant",
                    content: `Hello! Ask me anything about **"${vocabulary.english}"**. I can help with meanings, examples, synonyms, and usage.`,
                    timestamp: Date.now()
                };
                setMessages([welcomeMessage]);
                setSessionStats({ tokens: 0, cost: 0 });
            }

            // Focus input on open for better accessibility
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [vocabulary]);

    // Handle initial prompt
    useEffect(() => {
        if (initialPrompt && !hasProcessedInitialPrompt.current && !needsApiKey && vocabulary) {
            hasProcessedInitialPrompt.current = true;
            setInput(initialPrompt);
            // Auto-send removed as requested to allow user to review before sending
            inputRef.current?.focus();
        }
    }, [initialPrompt, needsApiKey, vocabulary]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isLoading]);

    const handleCopy = async (content: string, index: number) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIndex(index);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
        e?.preventDefault();
        const textToSend = overrideInput || input;

        if (!textToSend.trim() || !vocabulary) return;

        if (!hasOpenAIApiKey()) {
            setNeedsApiKey(true);
            return;
        }

        setInput("");

        const userMessage: ChatMessage = {
            role: "user",
            content: textToSend,
            timestamp: Date.now()
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            // Create history array for the service
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            history.push({ role: "user", content: textToSend });

            // Call OpenAI Service
            const result = await chatWithVocabulary(vocabulary, history as any);

            const modelId = getSelectedModel() || DEFAULT_MODEL;
            const cost = calculateCost(result.usage.promptTokens, result.usage.completionTokens, modelId);

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: result.content,
                timestamp: Date.now(),
                tokens: {
                    input: result.usage.promptTokens,
                    output: result.usage.completionTokens,
                    total: result.usage.totalTokens
                },
                cost
            };

            const updatedMessages = [...messages, userMessage, assistantMessage];
            setMessages(updatedMessages);

            // Update session stats
            const newTotalTokens = sessionStats.tokens + result.usage.totalTokens;
            const newTotalCost = sessionStats.cost + cost;
            setSessionStats({ tokens: newTotalTokens, cost: newTotalCost });

            // Save session to local storage
            const session: ChatSession = {
                id: `chat-${vocabulary.id}`,
                vocabularyId: vocabulary.id,
                vocabularyWord: vocabulary.english,
                messages: updatedMessages,
                totalTokens: newTotalTokens,
                totalCost: newTotalCost,
                createdAt: getChatSessionByVocabulary(vocabulary.id)?.createdAt || Date.now(),
                updatedAt: Date.now()
            };
            saveChatSession(session);

            // Save token usage record
            saveTokenUsage({
                id: `usage-${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
                vocabularyId: vocabulary.id,
                vocabularyWord: vocabulary.english,
                modelId,
                inputTokens: result.usage.promptTokens,
                outputTokens: result.usage.completionTokens,
                totalTokens: result.usage.totalTokens,
                cost
            });

        } catch (error: any) {
            console.error(error);
            // Handle Invalid API Key specifically
            if (error.message && (error.message.includes("Invalid API key") || error.message.includes("401"))) {
                setNeedsApiKey(true);
                toast.error("Invalid API Key. Please check your settings.");
            } else {
                toast.error(error.message || "Failed to get response from AI.");
                setMessages((prev) => [...prev, {
                    role: "assistant",
                    content: "⚠️ Something went wrong. Please try again.",
                    timestamp: Date.now()
                }]);
            }
        } finally {
            setIsLoading(false);
            // Refocus input after sending
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSend();
        }
    };

    const modelData = getModelById(getSelectedModel() || DEFAULT_MODEL);

    return (
        <div className={cn(
            "flex flex-col bg-background",
            isPageMode ? "h-[100vh] w-full" : "h-full w-full"
        )}>
            {/* Header */}
            <div className={cn(
                "px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20",
                "relative flex-shrink-0",
                "sm:px-6 sm:py-4"
            )}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isPageMode && onClose && (
                            <Button variant="ghost" size="icon" onClick={onClose} className="mr-1 -ml-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        <Bot className={cn(
                            "text-primary flex-shrink-0",
                            isMobile ? "w-4 h-4" : "w-5 h-5"
                        )} />
                        <h2 className={cn(
                            "truncate font-semibold text-foreground",
                            isMobile ? "text-base" : "text-lg"
                        )}>
                            Chat: {vocabulary.english}
                        </h2>
                    </div>

                    {/* Close button - only show if not in page mode or if explicitly requested */}
                    {!isPageMode && onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "flex-shrink-0 text-muted-foreground hover:text-foreground",
                                isMobile ? "h-8 w-8" : "h-9 w-9"
                            )}
                            onClick={onClose}
                            aria-label="Close chat"
                        >
                            <X className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
                        </Button>
                    )}
                </div>

                {/* Session Stats - Responsive layout */}
                <div className={cn(
                    "flex items-center gap-2 mt-2 text-xs flex-wrap",
                    isMobile ? "gap-1" : "gap-3"
                )}>
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <Zap className={cn("flex-shrink-0", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span>{sessionStats.tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <DollarSign className={cn("flex-shrink-0", isMobile ? "h-2.5 w-2.5" : "h-3 w-3")} />
                        <span>{formatCost(sessionStats.cost)}</span>
                    </div>
                    {modelData && (
                        <div className="text-muted-foreground truncate text-xs">
                            <span>Model: {modelData.name}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* If API Key is missing, show Manager instead of Chat */}
            {needsApiKey ? (
                <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center overflow-y-auto">
                    <div className="text-center mb-4 sm:mb-6">
                        <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>
                            OpenAI API Key Required
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            Please configure your API key to start chatting.
                        </p>
                    </div>
                    <div className="max-w-md mx-auto w-full">
                        <OpenAIApiKeyManager />
                    </div>
                    <Button
                        variant="ghost"
                        className="mt-4 mx-auto"
                        onClick={() => setNeedsApiKey(false)}
                    >
                        I have configured it, go back
                    </Button>
                </div>
            ) : (
                <>
                    <ScrollArea
                        ref={scrollAreaRef}
                        className="flex-1 p-3 sm:p-4"
                    >
                        <div className="space-y-4 sm:space-y-6 min-h-full pb-4">
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex gap-2 sm:gap-3 w-full",
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    )}
                                >
                                    {msg.role === "assistant" && (
                                        <div className={cn(
                                            "rounded-full bg-primary/10 flex items-center justify-center border flex-shrink-0 mt-1",
                                            isMobile ? "w-7 h-7" : "w-8 h-8"
                                        )}>
                                            <Bot className={cn(
                                                "text-primary",
                                                isMobile ? "w-3 h-3" : "w-4 h-4"
                                            )} />
                                        </div>
                                    )}

                                    <div className={cn(
                                        "flex flex-col gap-1 max-w-[85%]",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}>
                                        <div
                                            className={cn(
                                                "rounded-2xl px-4 py-3 text-sm shadow-sm relative break-words w-full",
                                                "max-w-full word-break-word",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                                    : "bg-muted/50 text-foreground rounded-bl-none border"
                                            )}
                                        >
                                            {msg.role === "assistant" ? (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                                                        strong: ({ children }) => <span className="font-bold text-primary/90">{children}</span>,
                                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                                                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="border-l-2 border-primary/50 pl-2 italic my-2 text-muted-foreground">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        code: ({ children }) => (
                                                            <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono break-all">
                                                                {children}
                                                            </code>
                                                        )
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            ) : (
                                                <div className="leading-relaxed break-words">{msg.content}</div>
                                            )}
                                        </div>

                                        {/* Action Bar for Assistant Messages */}
                                        {msg.role === "assistant" && (
                                            <div className="flex items-center gap-3 mt-1 ml-1">
                                                <button
                                                    onClick={() => handleCopy(msg.content, i)}
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    {copiedIndex === i ? (
                                                        <>
                                                            <Check className="w-3 h-3 text-green-500" />
                                                            <span className="text-green-500">Copied</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3 h-3" />
                                                            <span>Copy</span>
                                                        </>
                                                    )}
                                                </button>

                                                {/* Token/Cost info */}
                                                {msg.tokens && msg.cost !== undefined && (
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 border-l pl-2 ml-1">
                                                        <span className="flex items-center gap-0.5">
                                                            <Zap className="h-2.5 w-2.5" />
                                                            {msg.tokens.total}
                                                        </span>
                                                        <span className="flex items-center gap-0.5">
                                                            <DollarSign className="h-2.5 w-2.5" />
                                                            {formatCost(msg.cost)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <div className={cn(
                                            "rounded-full flex items-center justify-center border flex-shrink-0 overflow-hidden bg-muted mt-1",
                                            isMobile ? "w-7 h-7" : "w-8 h-8"
                                        )}>
                                            {user?.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt={user.displayName || "User"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <User className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-2 sm:gap-3">
                                    <div className={cn(
                                        "rounded-full bg-primary/10 flex items-center justify-center border flex-shrink-0",
                                        isMobile ? "w-7 h-7" : "w-8 h-8"
                                    )}>
                                        <Bot className={cn(
                                            "text-primary",
                                            isMobile ? "w-3 h-3" : "w-4 h-4"
                                        )} />
                                    </div>
                                    <div className={cn(
                                        "bg-muted/50 rounded-2xl rounded-bl-none flex items-center border",
                                        isMobile ? "px-3 py-2" : "px-4 py-3"
                                    )}>
                                        <Loader2 className={cn(
                                            "animate-spin text-muted-foreground",
                                            isMobile ? "w-4 h-4" : "w-5 h-5"
                                        )} />
                                        <span className={cn(
                                            "text-muted-foreground ml-2",
                                            isMobile ? "text-sm" : "text-base"
                                        )}>
                                            Thinking...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Invisible element for auto-scroll */}
                            <div className="h-px" aria-hidden="true" />
                        </div>
                    </ScrollArea>

                    {/* Input area - Mobile optimized */}
                    <div className={cn(
                        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                        isMobile ? "p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]" : "p-4"
                    )}>
                        <form onSubmit={(e) => handleSend(e)} className="flex gap-2 w-full">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isMobile ? "Ask about this word..." : "Ask for examples, synonyms, or usage..."}
                                disabled={isLoading}
                                className={cn(
                                    "flex-1 min-w-0",
                                    isMobile ? "text-sm min-h-[44px]" : "min-h-[48px]",
                                    "focus:ring-2 focus:ring-primary/20"
                                )}
                                aria-label="Type your message"
                            />
                            <Button
                                type="submit"
                                size={isMobile ? "icon" : "default"}
                                disabled={isLoading || !input.trim()}
                                className={cn(
                                    "flex-shrink-0 transition-all",
                                    isMobile ? "h-11 w-11" : "px-6 h-12",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    "hover:scale-105 active:scale-95"
                                )}
                                aria-label="Send message"
                            >
                                {isMobile ? (
                                    <Send className="w-4 h-4" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Send
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Keyboard shortcut hint - Only show on desktop */}
                        {!isMobile && (
                            <div className="text-xs text-muted-foreground mt-2 text-center">
                                Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">Enter</kbd> to send quickly
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
