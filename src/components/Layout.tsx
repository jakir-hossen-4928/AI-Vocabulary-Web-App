import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { MobileDrawer } from "./MobileDrawer";
import { MobileHeader } from "./MobileHeader";

export const Layout = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <MobileHeader onMenuClick={() => setDrawerOpen(true)} />
            <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
            <main className="md:pl-64 pb-16 md:pb-0 min-h-screen pt-[52px] md:pt-0">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};
