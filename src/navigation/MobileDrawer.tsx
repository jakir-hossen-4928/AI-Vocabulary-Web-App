import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, GraduationCap, User, Activity, Globe, LogOut, Users, Shield, Layers, Upload, Heart, Plus, Wand2, LayoutDashboard, Settings, Search } from "lucide-react";
import { NavLink } from "@/navigation/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useNative } from "@/hooks/useNative";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Logo } from "./Logo";

const mainNavItems = [
    { path: "/home", icon: Home, label: "Home" },
    { path: "/dictionary", icon: Globe, label: "Online Dictionary" },
    { path: "/vocabularies", icon: BookOpen, label: "Vocabulary" },
    { path: "/favorites", icon: Heart, label: "Favorites" },
    { path: "/flashcards", icon: Layers, label: "Flashcards" },
];

const adminNavItems = [
    { path: "/admin/analytics", icon: LayoutDashboard, label: "Analytics" },
    { path: "/vocabularies/add", icon: Plus, label: "Add Vocabulary" },
    { path: "/admin/users", icon: Users, label: "Manage Users" },
    { path: "/admin/tools", icon: Wand2, label: "AI Enhancement" },
    { path: "/admin/resources", icon: GraduationCap, label: "Resources Manager" },
    { path: "/admin/duplicates", icon: Shield, label: "Duplicate Manager" },
    { path: "/vocabularies/bulk-add", icon: Upload, label: "Bulk Upload" },
];

interface MobileDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const MobileDrawer = ({ open, onOpenChange }: MobileDrawerProps) => {
    const { user, isAdmin } = useAuth();
    const { haptic } = useNative();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        haptic('light');
        try {
            await signOut(auth);
            toast.success("Signed out successfully");
            navigate("/auth");
            onOpenChange(false);
        } catch (error) {
            toast.error("Failed to sign out");
        }
    };

    const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => (
        <NavLink
            to={item.path}
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all active:scale-[0.98]"
            activeClassName="bg-primary/10 text-primary font-semibold shadow-sm"
        >
            <item.icon className="h-5 w-5" />
            <span className="text-sm">{item.label}</span>
        </NavLink>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="px-4 pt-6 pb-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {title}
            </p>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="w-[300px] p-0 flex flex-col border-r-0 sm:border-r"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                {/* User Profile Header */}
                <div className="relative overflow-hidden pt-[var(--safe-area-top)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent -z-10" />
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <Logo onOpenChange={onOpenChange} />
                        </div>
                        <div className="flex items-center gap-4 mb-4 group cursor-pointer" onClick={() => { navigate("/profile"); onOpenChange(false); }}>
                            <Avatar className="h-14 w-14 border-2 border-primary/20 p-0.5 bg-background shadow-lg transition-transform group-hover:scale-105">
                                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                                <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold truncate leading-tight">
                                    {user?.displayName || 'Welcome Back!'}
                                </h2>
                                <p className="text-xs text-muted-foreground truncate">
                                    {user?.email || 'Start your learning journey'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-50" />

                {/* Navigation Content */}
                <ScrollArea className="flex-1">
                    <div className="px-3 py-2 space-y-1">
                        <SectionHeader title="Cambridge Dictionary" />
                        <div className="px-4 py-2">
                            <form
                                action='https://dictionary.cambridge.org/us/search/english/direct/'
                                method='get'
                                target='_blank'
                                className="relative group"
                            >
                                <input type='hidden' name='utm_source' value='widget_searchbox_source' />
                                <input type='hidden' name='utm_medium' value='widget_searchbox' />
                                <input type='hidden' name='utm_campaign' value='widget_tracking' />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    className='w-full pl-9 pr-10 h-10 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all rounded-xl text-sm placeholder:text-muted-foreground focus:ring-4 focus:ring-primary/5 outline-none'
                                    name='q'
                                    placeholder='Search word...'
                                    type='search'
                                    autoComplete='off'
                                />
                                <button
                                    type='submit'
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                >
                                    <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                                </button>
                            </form>

                        </div>

                        <SectionHeader title="Menu" />
                        {mainNavItems.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}

                        {isAdmin && (
                            <>
                                <SectionHeader title="Admin Panel" />
                                {adminNavItems.map((item) => (
                                    <NavItem key={item.path} item={item} />
                                ))}
                            </>
                        )}

                        <SectionHeader title="Settings" />
                        <NavItem item={{ path: "/api-key-setup", icon: Shield, label: "AI API Configuration" }} />
                    </div>
                </ScrollArea>

                {/* Footer / Sign Out */}
                <div className="p-4 bg-muted/20 pb-[calc(1rem+var(--safe-area-bottom))]">
                    <Button
                        variant="ghost"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/20 transition-all font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Logout of Account</span>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
