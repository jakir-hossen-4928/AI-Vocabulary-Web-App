import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, BookOpen, PenTool, Headphones, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function IELTSDashboard() {
    const navigate = useNavigate();

    const modules = [
        {
            title: "Speaking",
            icon: Mic,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            path: "/ielts/speaking",
            description: "Practice speaking with AI feedback on pronunciation and fluency.",
        },
        {
            title: "Reading",
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            path: "/ielts/reading",
            description: "Improve comprehension with timed reading passages and questions.",
        },
        {
            title: "Writing",
            icon: PenTool,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            path: "/ielts/writing",
            description: "Get instant scores and suggestions for your essays and reports.",
        },
        {
            title: "Listening",
            icon: Headphones,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            path: "/ielts/listening",
            description: "Train your ear with diverse accents and conversation styles.",
        },
    ];

    return (
        <div className="min-h-screen bg-background p-6 pb-24 md:pb-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">IELTS Prep Suite</h1>
                    <p className="text-muted-foreground">
                        Master all four components of the IELTS exam with AI-powered tools.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-6">
                    {modules.map((module, index) => (
                        <motion.div
                            key={module.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(module.path)}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${module.bg}`}>
                                        <module.icon className={`h-8 w-8 ${module.color}`} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                    </Button>
                                </div>
                                <h2 className="text-xl font-semibold mb-2">{module.title}</h2>
                                <p className="text-muted-foreground text-sm">
                                    {module.description}
                                </p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
