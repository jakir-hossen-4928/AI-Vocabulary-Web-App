import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, BookOpen, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/vocabularies?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { label: "Total Words", value: "0", icon: BookOpen, color: "text-primary" },
    { label: "This Week", value: "0", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Welcome back!</h1>
          <p className="text-primary-foreground/80 text-sm">
            Let's boost your IELTS vocabulary today
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        {/* Search Card */}
        <Card className="p-4 shadow-hover mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vocabulary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Search
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-4 shadow-card">
              <div className="flex items-start justify-between mb-2">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        {isAdmin && (
          <Card className="p-4 shadow-card mb-6">
            <h2 className="font-semibold text-foreground mb-3">Quick Actions</h2>
            <Button
              onClick={() => navigate("/vocabularies/add")}
              className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Vocabulary
            </Button>
          </Card>
        )}

        {/* Learning Tips */}
        <Card className="p-4 bg-secondary/50 border-secondary">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Daily Tip
          </h3>
          <p className="text-sm text-muted-foreground">
            Practice speaking new words aloud using the text-to-speech feature. 
            Hearing pronunciation helps with retention and builds confidence!
          </p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
