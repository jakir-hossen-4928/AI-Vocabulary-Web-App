import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

export const Layout = () => {
    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="md:pl-64 pb-16 md:pb-0 min-h-screen">
                <Outlet />
            </main>
            <BottomNav />
        </div>
    );
};
