import { Home, BookOpen, GraduationCap, User, Activity, Globe, Shield, Users, LogOut, BarChart, Layers, Upload } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
    { path: "/dictionary", icon: Globe, label: "Dictionary" },
    { path: "/resources", icon: GraduationCap, label: "Resources" },
    { path: "/ai-activity", icon: Activity, label: "AI Activity" },
    { path: "/profile", icon: User, label: "Profile" },
];

export const Sidebar = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-card z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Ai Vocab
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                        activeClassName="bg-primary/10 text-primary font-medium"
                    >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {/* Settings Section */}
                <div className="pt-4 pb-2 px-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Settings
                    </p>
                </div>
                <NavLink
                    to="/api-key-setup"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                    activeClassName="bg-primary/10 text-primary font-medium"
                >
                    <Shield className="h-5 w-5" />
                    <span>OpenAI API Setup</span>
                </NavLink>

                {isAdmin && (
                    <>
                        <div className="pt-4 pb-2 px-4">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Admin
                            </p>
                        </div>
                        <NavLink
                            to="/admin/users"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                            activeClassName="bg-primary/10 text-primary font-medium"
                        >
                            <Users className="h-5 w-5" />
                            <span>Manage Users</span>
                        </NavLink>
                        <NavLink
                            to="/admin/duplicates"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                            activeClassName="bg-primary/10 text-primary font-medium"
                        >
                            <Shield className="h-5 w-5" />
                            <span>Duplicate Manager</span>
                        </NavLink>
                        <NavLink
                            to="/vocabularies/bulk-add"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                            activeClassName="bg-primary/10 text-primary font-medium"
                        >
                            <Upload className="h-5 w-5" />
                            <span>Bulk Upload</span>
                        </NavLink>
                    </>
                )}
            </nav>


            <div className="p-4 border-t mt-auto">
                <button
                    onClick={async () => {
                        try {
                            await signOut(auth);
                            toast.success("Signed out successfully");
                            navigate("/auth");
                        } catch (error) {
                            toast.error("Failed to sign out");
                        }
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside >
    );
};
