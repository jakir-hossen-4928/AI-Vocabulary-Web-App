import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { User, Key, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    // Load API key from localStorage
    const savedKey = localStorage.getItem("googleAIKey");
    if (savedKey) setApiKey(savedKey);
  }, [user, loading, navigate]);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("googleAIKey", apiKey.trim());
      toast.success("API key saved successfully!");
    } else {
      toast.error("Please enter a valid API key");
    }
  };

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
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Profile</h1>
          <p className="text-primary-foreground/80 text-sm">
            Manage your account and settings
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* User Info */}
        <Card className="p-6 shadow-hover mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
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

        {/* API Key Section */}
        <Card className="p-6 shadow-card mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Google AI Studio API Key</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Your API key is stored locally and used to generate vocabulary content.
            Get your key from{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google AI Studio
            </a>
          </p>
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google AI Studio API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleSaveApiKey} className="w-full">
              Save API Key
            </Button>
          </div>
        </Card>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
