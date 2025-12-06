
import { useState, useMemo } from "react";
import { useVocabularies } from "@/hooks/useVocabularies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    BookOpen,
    Star,
    TrendingUp,
    Users,
    Calendar,
    Activity,
    Type,
    ArrowUpRight,
    Download
} from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays, isSameDay, parseISO } from "date-fns";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function AdminDashboard() {
    const { data: vocabularies = [], isLoading } = useVocabularies();
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

    // Stats Calculations
    const stats = useMemo(() => {
        if (!vocabularies.length) return null;

        const totalWords = vocabularies.length;

        // Sort logic for created dates
        const sortedByDate = [...vocabularies].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA; // Newest first
        });

        const recentWords = sortedByDate.slice(0, 5);

        // Words added today
        const today = new Date();
        const addedToday = vocabularies.filter(v => isSameDay(new Date(v.createdAt), today)).length;

        // POS Distribution
        const posDistribution = vocabularies.reduce((acc, curr) => {
            const pos = curr.partOfSpeech || 'unknown';
            acc[pos] = (acc[pos] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(posDistribution)
            .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
            .sort((a, b) => b.value - a.value);

        // Growth Data (Last 7 or 30 days)
        const days = timeRange === 'week' ? 7 : 30;
        const growthData = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            const dayStr = format(date, 'MMM dd');
            const count = vocabularies.filter(v => isSameDay(new Date(v.createdAt), date)).length;
            growthData.push({
                date: dayStr,
                words: count,
                fullDate: date
            });
        }

        return {
            totalWords,
            addedToday,
            pieData,
            growthData,
            recentWords
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your vocabulary database performance and statistics.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Export or other actions could go here */}
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="hover:shadow-lg transition-all duration-300 border-primary/10 bg-gradient-to-br from-background to-primary/5">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
                            <BookOpen className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalWords.toLocaleString()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                +{(stats?.growthData.reduce((acc, cur) => acc + cur.words, 0) || 0)} in last {timeRange === 'week' ? '7' : '30'} days
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Added Today</CardTitle>
                            <Activity className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.addedToday}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                New entries in database
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                            <Type className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold truncate">
                                {stats?.pieData[0]?.name || 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.pieData[0]?.value} words ({((stats?.pieData[0]?.value || 0) / (stats?.totalWords || 1) * 100).toFixed(1)}%)
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Placeholder for future metric like active users or search queries */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="hover:shadow-lg transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Coming Soon</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                More metrics soon
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Growth Chart */}
                <motion.div
                    className="col-span-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Vocabulary Growth</CardTitle>
                                    <CardDescription>
                                        Number of words added over time
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={timeRange === 'week' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTimeRange('week')}
                                    >
                                        Week
                                    </Button>
                                    <Button
                                        variant={timeRange === 'month' ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setTimeRange('month')}
                                    >
                                        Month
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.growthData}>
                                        <defs>
                                            <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="words"
                                            stroke="#8884d8"
                                            fillOpacity={1}
                                            fill="url(#colorWords)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Distribution Chart */}
                <motion.div
                    className="col-span-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Part of Speech</CardTitle>
                            <CardDescription>
                                Distribution by grammatical category
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats?.pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats?.pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'hsl(var(--card))',
                                                borderColor: 'hsl(var(--border))',
                                                borderRadius: '8px',
                                            }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {stats?.pieData.slice(0, 4).map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="font-medium text-muted-foreground">{entry.name}</span>
                                        <span className="ml-auto font-bold">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Recent Activity Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Additions</CardTitle>
                        <CardDescription>Latest words added to the dictionary</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recentWords.map((word, i) => (
                                <div key={word.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{word.english}</p>
                                            <p className="text-sm text-muted-foreground">{word.partOfSpeech}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium font-bengali">{word.bangla}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(word.createdAt), 'MMM d, h:mm a')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
