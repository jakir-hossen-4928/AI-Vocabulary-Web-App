// OpenAI API Configuration and Pricing

export interface OpenAIModel {
    id: string;
    name: string;
    inputPricePerMillion: number;  // Price per 1M input tokens
    outputPricePerMillion: number; // Price per 1M output tokens
    contextWindow: number;
    description: string;
}

export const OPENAI_MODELS: OpenAIModel[] = [
    {
        id: "gpt-4o",
        name: "GPT-4o",
        inputPricePerMillion: 2.50,
        outputPricePerMillion: 10.00,
        contextWindow: 128000,
        description: "Most capable, best for complex tasks"
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        inputPricePerMillion: 0.150,
        outputPricePerMillion: 0.600,
        contextWindow: 128000,
        description: "Affordable and intelligent, great for most tasks"
    },
    {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        inputPricePerMillion: 0.50,
        outputPricePerMillion: 1.50,
        contextWindow: 16385,
        description: "Fast and affordable, good for simple tasks"
    }
];

export const DEFAULT_MODEL = "gpt-3.5-turbo";

// Calculate cost for a given number of tokens
export function calculateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    const model = OPENAI_MODELS.find(m => m.id === modelId);
    if (!model) return 0;

    const inputCost = (inputTokens / 1_000_000) * model.inputPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * model.outputPricePerMillion;

    return inputCost + outputCost;
}

// Format cost in dollars
export function formatCost(cost: number): string {
    if (cost < 0.01) {
        return `$${(cost * 1000).toFixed(4)}k`; // Show in thousandths
    }
    return `$${cost.toFixed(4)}`;
}

// Get model by ID
export function getModelById(modelId: string): OpenAIModel | undefined {
    return OPENAI_MODELS.find(m => m.id === modelId);
}
