import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { DollarSign, Zap, TrendingUp, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getTotalSpending, getAllTokenUsage } from "@/lib/apiKeyStorage";
import { formatCost, getModelById } from "@/lib/openaiConfig";

export function TokenUsageStats() {
    const [stats, setStats] = useState({
        totalCost: 0,
        totalTokens: 0,
        recordCount: 0
    });
    const [recentUsage, setRecentUsage] = useState<any[]>([]);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = () => {
        const spending = getTotalSpending();
        setStats(spending);

        const allUsage = getAllTokenUsage();
        setRecentUsage(allUsage.slice(-10).reverse()); // Last 10 records
    };

    return (
        <div className="space-y-4">
            <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                    <strong>OpenAI API:</strong> Pay-as-you-go pricing. All usage tracked locally for transparency.
                </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Cost</p>
                            <p className="text-xl font-bold text-green-600">{formatCost(stats.totalCost)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Zap className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total Tokens</p>
                            <p className="text-xl font-bold text-blue-600">{stats.totalTokens.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Requests</p>
                            <p className="text-xl font-bold text-purple-600">{stats.recordCount}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {recentUsage.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                        {recentUsage.map((record) => {
                            const model = getModelById(record.modelId);
                            return (
                                <div key={record.id} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                                    <div className="flex-1">
                                        <p className="font-medium">{record.vocabularyWord}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(record.timestamp).toLocaleDateString()} • {model?.name || record.modelId}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">{formatCost(record.cost)}</p>
                                        <p className="text-xs text-muted-foreground">{record.totalTokens.toLocaleString()} tokens</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            <Card className="p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                    💡 All data stored locally. Costs are calculated based on OpenAI's official pricing.
                </p>
            </Card>
        </div>
    );
}
