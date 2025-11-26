import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Key, Check, Trash2, ExternalLink, DollarSign, Zap } from "lucide-react";
import {
    saveOpenAIApiKey,
    getOpenAIApiKey,
    removeOpenAIApiKey,
    hasOpenAIApiKey,
    saveSelectedModel,
    getSelectedModel,
    getTotalSpending
} from "@/lib/apiKeyStorage";
import { OPENAI_MODELS, DEFAULT_MODEL, formatCost } from "@/lib/openaiConfig";
import { toast } from "sonner";

export function OpenAIApiKeyManager() {
    const [apiKey, setApiKey] = useState("");
    const [isKeySaved, setIsKeySaved] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
    const [spending, setSpending] = useState({ totalCost: 0, totalTokens: 0, recordCount: 0 });

    useEffect(() => {
        setIsKeySaved(hasOpenAIApiKey());
        const savedModel = getSelectedModel();
        if (savedModel) setSelectedModel(savedModel);
        updateSpending();
    }, []);

    const updateSpending = () => {
        const stats = getTotalSpending();
        setSpending(stats);
    };

    const handleSave = () => {
        const trimmedKey = apiKey.trim();
        if (!trimmedKey) {
            toast.error("Please enter an API key");
            return;
        }

        if (!trimmedKey.startsWith("sk-")) {
            toast.error("Invalid API key format. OpenAI keys start with 'sk-'");
            return;
        }

        saveOpenAIApiKey(trimmedKey);
        setIsKeySaved(true);
        setApiKey("");
        toast.success("API Key saved successfully!");
    };

    const handleRemove = () => {
        removeOpenAIApiKey();
        setIsKeySaved(false);
        toast.info("API Key removed.");
    };

    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        saveSelectedModel(modelId);
        toast.success(`Model changed to ${OPENAI_MODELS.find(m => m.id === modelId)?.name}`);
    };

    const selectedModelData = OPENAI_MODELS.find(m => m.id === selectedModel);

    if (isKeySaved) {
        return (
            <div className="space-y-4">
                <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-green-900 dark:text-green-100">OpenAI API Key Active</h3>
                                <p className="text-xs text-green-700 dark:text-green-300">Ready to chat with AI</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                        </Button>
                    </div>
                </Card>

                {/* Model Selection */}
                <Card className="p-4">
                    <div className="space-y-3">
                        <Label htmlFor="model-select" className="text-sm font-semibold">AI Model</Label>
                        <Select value={selectedModel} onValueChange={handleModelChange}>
                            <SelectTrigger id="model-select">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {OPENAI_MODELS.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        <div className="flex items-center justify-between w-full">
                                            <span>{model.name}</span>
                                            <span className="text-xs text-muted-foreground ml-2">
                                                ${model.inputPricePerMillion}/M in
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedModelData && (
                            <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-2">
                                <p className="text-xs text-muted-foreground">{selectedModelData.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3 text-green-600" />
                                        <span>Input: ${selectedModelData.inputPricePerMillion}/M tokens</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3 text-blue-600" />
                                        <span>Output: ${selectedModelData.outputPricePerMillion}/M tokens</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Zap className="h-3 w-3" />
                                    <span>Context: {selectedModelData.contextWindow.toLocaleString()} tokens</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Usage Statistics */}
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Spending (All Time)
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                                <p className="text-xs text-muted-foreground">Cost</p>
                                <p className="text-lg font-bold text-green-600">{formatCost(spending.totalCost)}</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                                <p className="text-xs text-muted-foreground">Tokens</p>
                                <p className="text-lg font-bold text-blue-600">{spending.totalTokens.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded">
                                <p className="text-xs text-muted-foreground">Requests</p>
                                <p className="text-lg font-bold text-purple-600">{spending.recordCount}</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            💡 All data stored locally on your device
                        </p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <Card className="p-6 space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4" /> Setup OpenAI API
                </h3>
                <p className="text-sm text-muted-foreground">
                    Get your API key from{" "}
                    <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                    >
                        OpenAI Platform <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                </p>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        ⚠️ Your API key is stored locally and never sent to our servers.
                        You'll be charged by OpenAI based on your usage.
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="api-key"
                            type={showKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <Button onClick={handleSave} disabled={!apiKey}>
                        <Key className="h-4 w-4 mr-2" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Pricing Preview */}
            <div className="pt-4 border-t space-y-2">
                <h4 className="text-sm font-medium">Pricing (per 1M tokens)</h4>
                <div className="space-y-1">
                    {OPENAI_MODELS.map((model) => (
                        <div key={model.id} className="flex justify-between text-xs p-2 bg-muted/30 rounded">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-muted-foreground">
                                ${model.inputPricePerMillion} in / ${model.outputPricePerMillion} out
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}