import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, query, where, getCountFromServer } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { User, LogOut, Shield, BookOpen, TrendingUp, GraduationCap, Download } from "lucide-react";
import { toast } from "sonner";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [totalWords, setTotalWords] = useState(0);
  const [masteredWords, setMasteredWords] = useState(0);
  const { isInstallable, installApp } = useInstallPrompt();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const coll = collection(db, "vocabularies");
        const q = query(coll, where("userId", "==", user.uid));
        const snapshot = await getCountFromServer(q);
        setTotalWords(snapshot.data().count);

        // Placeholder for mastered words until logic is implemented
        setMasteredWords(0);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-primary-foreground/80 text-sm">
            Manage your account and settings
          </p>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 shadow-hover mb-4">
            <div className="flex items-start gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              <div className="flex-1">
                <h2 className="font-semibold text-foreground mb-1">
                  {user?.displayName || "User"}
                </h2>
                <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
                {isAdmin && (
                  <Badge variant="default" className="bg-accent">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={() => navigate("/admin/grammar")}
              variant="outline"
              className="w-full mb-3 border-primary/20 "
            >
              <GraduationCap className="mr-2 h-4 w-4 text-primary" />
              Manage Grammar Gallery
            </Button>
            <Button
              onClick={() => navigate("/admin/users")}
              variant="outline"
              className="w-full mb-6 border-primary/20 "
            >
              <User className="mr-2 h-4 w-4 text-primary" />
              Manage Users
            </Button>
          </motion.div>
        )}

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handleSignOut}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </motion.div>

        {/* PWA Install Button */}
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              onClick={installApp}
              variant="outline"
              className="w-full mt-4 border-primary/20"
            >
              <Download className="mr-2 h-4 w-4 text-primary" />
              Install App
            </Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div >
  );
}
