import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Sparkles, Smartphone, ArrowRight } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function Auth() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/home");
        }
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Welcome back!");
            navigate("/home");
        } catch (error: any) {
            console.error("Sign in error:", error);
            toast.error(error.message || "Failed to sign in.");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 bg-cover bg-center bg-no-repeat relative"
            style={{ backgroundImage: "url('/background.png')" }}
        >
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-6 shadow-lg shadow-primary/20">
                        <img className="w-full h-full object-contain rounded-md border border-slate-200 " src="../../public/icon.png" alt="" />
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                        AI Vocab
                    </h1>
                    <p className="text-slate-200">
                        Master language with smart tools.
                    </p>
                </div>

                <Card className="p-8 border shadow-sm bg-white rounded-3xl">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-bold mb-1">Welcome back</h2>
                        <p className="text-sm text-muted-foreground">Sign in to continue your journey</p>
                    </div>

                    <Button
                        onClick={handleGoogleSignIn}
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-base font-medium border-2 rounded-2xl  transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="mt-8 pt-8 border-t">
                        <motion.div
                            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate("/download")}
                            className="p-5 rounded-2xl bg-white border border-slate-200 cursor-pointer flex items-center justify-between group transition-all duration-300 shadow-sm hover:border-primary/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary/5 transition-colors overflow-hidden p-1">
                                    <img className="w-full h-full object-contain rounded-lg" src="/icon.png" alt="App Icon" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900">Download Mobile App</h4>
                                    <p className="text-xs text-slate-500 font-medium">Get the official Android APK</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                        </motion.div>
                    </div>
                </Card>

                <p className="mt-10 text-center text-xs text-slate-400 uppercase tracking-widest font-medium">
                    &copy; {new Date().getFullYear()} AI Vocab
                </p>
            </div>
        </div>
    );
}
