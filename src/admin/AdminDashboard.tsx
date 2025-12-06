import { useState, useMemo } from "react";
import { useVocabularies } from "@/hooks/useVocabularies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from "recharts";
import {
    BookOpen,
    Activity,
    Type,
    Download,
    Headphones,
    FileText,
    Layers,
    Calendar as CalendarIcon,
    AlertCircle,
    CheckCircle2,
    RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import {
    format,
    subDays,
    isSameDay,
    eachDayOfInterval,
    getDay,
    getHours
} from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Helper to reliably parse dates
const safeDate = (date: any): Date => {
    if (!date) return new Date();
    try {
        if (typeof date === 'object' && 'toDate' in date) {
            return date.toDate();
        }
        if (typeof date === 'number') {
            return new Date(date);
        }
        const d = new Date(date);
        return isNaN(d.getTime()) ? new Date() : d;
    } catch (e) {
        return new Date();
    }
};

export default function AdminDashboard() {
    const { data: vocabularies = [], isLoading, refresh, isRefetching } = useVocabularies();
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    // Advanced Stats Calculations
    const stats = useMemo(() => {
        if (!vocabularies.length) return null;

        const totalWords = vocabularies.length;
        const now = new Date();

        // 1. Data Quality Metrics
        const withAudio = vocabularies.filter(v => v.audioUrl).length;
        const withExamples = vocabularies.filter(v => v.examples && v.examples.length > 0).length;
        const withSynonyms = vocabularies.filter(v => v.synonyms && v.synonyms.length > 0).length;

        const qualityScores = {
            audio: Math.round((withAudio / totalWords) * 100),
            examples: Math.round((withExamples / totalWords) * 100),
            synonyms: Math.round((withSynonyms / totalWords) * 100),
            overall: Math.round(((withAudio + withExamples + withSynonyms) / (totalWords * 3)) * 100)
        };

        // 2. Contributions / Heatmap Data (Last 365 days)
        const yearStart = subDays(now, 364);
        const daysMap = new Map<string, number>();

        vocabularies.forEach(v => {
            const dateStr = format(safeDate(v.createdAt), 'yyyy-MM-dd');
            daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + 1);
        });

        const heatmapData = [];
        let maxCount = 0;
        const heatmapDays = eachDayOfInterval({ start: yearStart, end: now });

        for (const day of heatmapDays) {
            const dateStr = format(day, 'yyyy-MM-dd');
            const count = daysMap.get(dateStr) || 0;
            if (count > maxCount) maxCount = count;
            heatmapData.push({ date: day, count, dateStr });
        }

        // 3. Hourly Distribution
        const hourlyDist = new Array(24).fill(0);
        const dayOfWeekDist = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(name => ({ name, count: 0 }));

        vocabularies.forEach(v => {
            const d = safeDate(v.createdAt);
            hourlyDist[getHours(d)]++;
            dayOfWeekDist[getDay(d)].count++;
        });

        const hourlyData = hourlyDist.map((count, hour) => ({
            hour: format(new Date().setHours(hour), 'ha'), // 1am, 2pm
            count
        }));

        // 4. POS Distribution
        const posCalc = vocabularies.reduce((acc, curr) => {
            const pos = curr.partOfSpeech || 'unknown';
            acc[pos] = (acc[pos] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(posCalc)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value);

        // 5. Growth Data
        const growthDays = timeRange === 'week' ? 7 : 30;
        const growthData = [];
        for (let i = growthDays - 1; i >= 0; i--) {
            const date = subDays(now, i);
            const dayStr = format(date, 'MMM dd');
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = vocabularies.filter(v => format(safeDate(v.createdAt), 'yyyy-MM-dd') === dateStr).length;
            growthData.push({
                date: dayStr,
                words: count,
                fullDate: date
            });
        }

        // 6. Recent
        const recentWords = [...vocabularies]
            .sort((a, b) => safeDate(b.createdAt).getTime() - safeDate(a.createdAt).getTime())
            .slice(0, 6);

        const addedToday = vocabularies.filter(v => isSameDay(safeDate(v.createdAt), now)).length;

        return {
            totalWords,
            addedToday,
            pieData,
            growthData,
            recentWords,
            qualityScores,
            heatmapData,
            maxCount,
            hourlyData,
            dayOfWeekDist,
            counts: { withAudio, withExamples, withSynonyms }
        };
    }, [vocabularies, timeRange]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 min-h-screen bg-background/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Analytics and performance overview
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refresh()}
                        disabled={isRefetching}
                        className={cn("transition-all", isRefetching ? "animate-pulse" : "")}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", isRefetching ? "animate-spin" : "")} />
                        {isRefetching ? "Syncing..." : "Sync Data"}
                    </Button>
                    <Button variant="default" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="quality">Quality Health</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Hero Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Words"
                            value={stats?.totalWords.toLocaleString() || '0'}
                            icon={BookOpen}
                            trend={`+${stats?.addedToday || 0} today`}
                            trendUp={true}
                            color="text-blue-500"
                        />
                        <StatCard
                            title="Added Today"
                            value={stats?.addedToday.toString() || '0'}
                            icon={Activity}
                            subtext="New entries"
                            color="text-green-500"
                        />
                        <StatCard
                            title="Data Quality"
                            value={`${stats?.qualityScores.overall}%`}
                            icon={CheckCircle2}
                            subtext="Completeness Score"
                            color="text-purple-500"
                        />
                        <StatCard
                            title="Top Category"
                            value={stats?.pieData[0]?.name || 'N/A'}
                            icon={Type}
                            subtext={`${stats?.pieData[0]?.value || 0} words`}
                            color="text-orange-500"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-7">
                        {/* Quick Growth Chart */}
                        <Card className="md:col-span-4 shadow-md">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Activity Trends</CardTitle>
                                    <div className="flex gap-1">
                                        <Button variant={timeRange === 'week' ? 'secondary' : 'ghost'} size="xs" onClick={() => setTimeRange('week')}>7d</Button>
                                        <Button variant={timeRange === 'month' ? 'secondary' : 'ghost'} size="xs" onClick={() => setTimeRange('month')}>30d</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pl-0">
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.growthData}>
                                            <defs>
                                                <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="words" stroke="#8884d8" fillOpacity={1} fill="url(#colorGrowth)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity List */}
                        <Card className="md:col-span-3 shadow-md flex flex-col">
                            <CardHeader>
                                <CardTitle>Recent Additions</CardTitle>
                                <CardDescription>Latest vocabulary entries</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-auto pr-2">
                                <div className="space-y-4">
                                    {stats?.recentWords.map((word, i) => (
                                        <div key={word.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm group-hover:scale-110 transition-transform">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{word.english}</p>
                                                    <p className="text-xs text-muted-foreground">{word.partOfSpeech}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium font-bengali text-sm">{word.bangla}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {format(safeDate(word.createdAt), 'MMM d, h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-6">
                    {/* Activity Heatmap */}
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                Contribution Activity
                            </CardTitle>
                            <CardDescription>Daily vocabulary contributions over the last year</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
                                {stats?.heatmapData.map((day, i) => (
                                    <Tooltip key={i} content={`${day.count} words on ${format(day.date, 'MMM do, yyyy')}`}>
                                        <div
                                            className={cn(
                                                "w-3 h-3 rounded-[2px] transition-colors hover:ring-2 hover:ring-offset-1 hover:ring-primary/50",
                                                day.count === 0 ? "bg-muted" :
                                                    day.count < 2 ? "bg-green-200 dark:bg-green-900/40" :
                                                        day.count < 5 ? "bg-green-400 dark:bg-green-700/60" :
                                                            "bg-green-600 dark:bg-green-500"
                                            )}
                                            title={`${day.count} words on ${day.dateStr}`}
                                        />
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Day of Week Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Habits</CardTitle>
                                <CardDescription>Words added by day of the week</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.dayOfWeekDist}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hourly Analysis */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Peak Hours</CardTitle>
                                <CardDescription>Activity time distribution (Current User)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.hourlyData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--muted))' }}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* POS Distribution Full */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vocabulary Composition</CardTitle>
                            <CardDescription>Part of Speech breakdown</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row items-center justify-around">
                            <div className="h-[300px] w-full sm:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {stats?.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full sm:w-1/3 grid grid-cols-2 gap-4">
                                {stats?.pieData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{entry.name}</span>
                                            <span className="text-xs text-muted-foreground">{entry.value} words</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* QUALITY TAB */}
                <TabsContent value="quality" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <QualityCard
                            title="Audio Coverage"
                            score={stats?.qualityScores.audio || 0}
                            icon={Headphones}
                            description={`${stats?.counts.withAudio} words have audio pronunciations`}
                            color="bg-blue-500"
                        />
                        <QualityCard
                            title="Example Usage"
                            score={stats?.qualityScores.examples || 0}
                            icon={FileText}
                            description={`${stats?.counts.withExamples} words have example sentences`}
                            color="bg-green-500"
                        />
                        <QualityCard
                            title="Synonyms & Antonyms"
                            score={stats?.qualityScores.synonyms || 0}
                            icon={Layers}
                            description={`${stats?.counts.withSynonyms} words have related terms`}
                            color="bg-purple-500"
                        />
                    </div>

                    <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-5 w-5" />
                                <CardTitle>Suggested Improvements</CardTitle>
                            </div>
                            <CardDescription>Actionable insights to improve your database</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm">
                                {stats?.qualityScores.audio < 100 && (
                                    <li className="flex items-center gap-2 opacity-80">
                                        • Add audio pronunciations to <strong>{stats?.totalWords - stats?.counts.withAudio}</strong> words.
                                    </li>
                                )}
                                {stats?.qualityScores.examples < 90 && (
                                    <li className="flex items-center gap-2 opacity-80">
                                        • Add example sentences to <strong>{stats?.totalWords - stats?.counts.withExamples}</strong> words to improve context.
                                    </li>
                                )}
                                <li className="flex items-center gap-2 opacity-80">
                                    • Review <strong>Uncategorized</strong> items to ensure better searching.
                                </li>
                            </ul>
                            <Button variant="outline" className="mt-4 border-orange-200 hover:bg-orange-100 dark:border-orange-800 dark:hover:bg-orange-900">
                                View To-Do List
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Sub-components for cleaner code
function StatCard({ title, value, icon: Icon, trend, trendUp, subtext, color }: any) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: 'currentColor' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <Icon className={cn("h-4 w-4", color)} />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {(trend || subtext) && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            {trend}
                            {subtext}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}

function QualityCard({ title, score, icon: Icon, description, color }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between mb-2">
                    <div className="text-2xl font-bold">{score}%</div>
                    <span className="text-xs text-muted-foreground">Health Score</span>
                </div>
                <Progress value={score} className="h-2" />
                <p className="text-xs text-muted-foreground mt-3">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
