import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Smartphone,
    Apple,
    Laptop,
    Download,
    ArrowLeft,
    CheckCircle2,
    ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DownloadPage() {
    const navigate = useNavigate();

    const androidUrl = "https://github.com/jakir-hossen-4928/ai-vocab-expo-app/releases/download/v1.0.0/ai-vocab.apk";

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10">
            {/* Nav */}
            <nav className="max-w-4xl mx-auto px-6 py-8">
                <Button
                    variant="ghost"
                    onClick={() => navigate("/")}
                    className="group -ml-4 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back
                </Button>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pb-24">
                {/* Hero */}
                <div className="mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
                    >
                        Download the App
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-2xl"
                    >
                        Master vocabulary on the go. Currently available for Android, with more platforms coming soon.
                    </motion.p>
                </div>

                {/* Primary Download (Android) */}
                <section className="mb-20">
                    <div className="bg-card border rounded-2xl p-8 sm:p-12 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold mb-4">
                                    <Smartphone className="h-3 w-3" />
                                    Android • v1.0.0
                                </div>
                                <h2 className="text-3xl font-bold mb-3">Download for Android</h2>
                                <p className="text-muted-foreground mb-6">
                                    Get the official APK to start your learning journey.
                                </p>
                                <Button
                                    size="lg"
                                    className="h-14 px-8 text-lg font-bold rounded-xl"
                                    onClick={() => window.open(androidUrl, '_blank')}
                                >
                                    <Download className="mr-3 h-5 w-5" />
                                    Download APK
                                </Button>
                            </div>

                            <div className="flex-shrink-0 grid grid-cols-1 gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>AI Pronunciation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Daily Vocabulary</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Sync Progress</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Other Platforms */}
                <section className="mb-20">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Other Platforms</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="group p-6 rounded-2xl border bg-muted/30 flex items-center justify-between grayscale opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-background border">
                                    <Apple className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold font-sans">iOS (iPhone)</h4>
                                    <p className="text-xs">Coming Soon</p>
                                </div>
                            </div>
                        </div>
                        <div className="group p-6 rounded-2xl border bg-muted/30 flex items-center justify-between grayscale opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-background border">
                                    <Laptop className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold font-sans">Windows Desktop</h4>
                                    <p className="text-xs">Coming Soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Info Grid */}
                <div className="grid md:grid-cols-2 gap-12 pt-12 border-t">
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            How to Install
                        </h3>
                        <ol className="space-y-4 text-muted-foreground">
                            <li className="flex gap-4">
                                <span className="font-bold text-foreground">1.</span>
                                <span>Download the <b>.apk</b> file above.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-foreground">2.</span>
                                <span>Open the file from your downloads notification.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-foreground">3.</span>
                                <span>If prompted, tap <b>Settings</b> and enable <b>"Allow from this source"</b>.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="font-bold text-foreground">4.</span>
                                <span>Tap <b>Install</b> and then <b>Open</b>.</span>
                            </li>
                        </ol>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Security Notice</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            This is an official release from the AI Vocabulary Coach team. We recommend downloading only from this page. If you encounter any issues, please contact support.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t text-center text-muted-foreground text-xs uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} AI Vocabulary Coach</p>
            </footer>
        </div>
    );
}
