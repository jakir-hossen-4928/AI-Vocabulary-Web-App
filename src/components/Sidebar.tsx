import { Home, BookOpen, GraduationCap, User, Heart, Globe } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/resources", icon: GraduationCap, label: "Resources" },
    { path: "/ielts", icon: Globe, label: "IELTS Prep" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/profile", icon: User, label: "Profile" },
];

export const Sidebar = () => {
    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-card z-50">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    Ai Vocab
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
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
            </nav>
        </aside>
    );
};
