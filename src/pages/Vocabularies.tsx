import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { VocabCard } from "@/components/VocabCard";
import { Plus, Search, Loader2, Filter, X } from "lucide-react";
import { useVocabularies } from "@/hooks/useVocabularies";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function Vocabularies() {
  const [searchParams] = useSearchParams();
  const { data: vocabularies = [], isLoading } = useVocabularies();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Advanced Filters State
  const [selectedPos, setSelectedPos] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = () => {
      const saved = localStorage.getItem("favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };
    loadFavorites();
    // Listen for storage events to update favorites if changed in another tab/component
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  // Update favorites when showFavorites is toggled to ensure freshness
  useEffect(() => {
    if (showFavorites) {
      const saved = localStorage.getItem("favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    }
  }, [showFavorites]);

  const filteredVocabs = vocabularies.filter((v) => {
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        v.bangla.toLowerCase().includes(query) ||
        v.english.toLowerCase().includes(query) ||
        v.partOfSpeech.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Part of Speech
    if (selectedPos !== "all" && v.partOfSpeech.toLowerCase() !== selectedPos.toLowerCase()) {
      return false;
    }

    // Favorites
    if (showFavorites && !favorites.includes(v.id)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (sortOrder) {
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "a-z":
        return a.english.localeCompare(b.english);
      case "z-a":
        return b.english.localeCompare(a.english);
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const activeFiltersCount = (selectedPos !== "all" ? 1 : 0) + (showFavorites ? 1 : 0) + (sortOrder !== "newest" ? 1 : 0);

  const clearFilters = () => {
    setSelectedPos("all");
    setSortOrder("newest");
    setShowFavorites(false);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-6 sticky top-0 z-10 shadow-md"
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Vocabularies</h1>
              <p className="text-primary-foreground/80 text-sm">
                {filteredVocabs.length} words found
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => navigate("/vocabularies/add")}
                size="icon"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-sm"
              >
                <Plus className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search words..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/50 hover:text-primary-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20 relative">
                  <Filter className="h-4 w-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-primary" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[20px] h-[80vh]">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filter & Sort</SheetTitle>
                  <SheetDescription>
                    Customize how you view your vocabulary list.
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-6">
                  {/* Sort Order */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="a-z">A-Z (English)</SelectItem>
                        <SelectItem value="z-a">Z-A (English)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Part of Speech */}
                  <div className="space-y-2">
                    <Label>Part of Speech</Label>
                    <Select value={selectedPos} onValueChange={setSelectedPos}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="noun">Noun</SelectItem>
                        <SelectItem value="verb">Verb</SelectItem>
                        <SelectItem value="adjective">Adjective</SelectItem>
                        <SelectItem value="adverb">Adverb</SelectItem>
                        <SelectItem value="preposition">Preposition</SelectItem>
                        <SelectItem value="conjunction">Conjunction</SelectItem>
                        <SelectItem value="pronoun">Pronoun</SelectItem>
                        <SelectItem value="interjection">Interjection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Favorites Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Favorites Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Show only words you've marked as favorite
                      </p>
                    </div>
                    <Switch
                      checked={showFavorites}
                      onCheckedChange={setShowFavorites}
                    />
                  </div>

                  {/* Active Filters Summary */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedPos !== "all" && (
                        <Badge variant="secondary" onClick={() => setSelectedPos("all")} className="cursor-pointer">
                          Type: {selectedPos} <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      {sortOrder !== "newest" && (
                        <Badge variant="secondary" onClick={() => setSortOrder("newest")} className="cursor-pointer">
                          Sort: {sortOrder} <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      {showFavorites && (
                        <Badge variant="secondary" onClick={() => setShowFavorites(false)} className="cursor-pointer">
                          Favorites Only <X className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs text-muted-foreground">
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>

                <SheetFooter className="mt-8">
                  <SheetClose asChild>
                    <Button className="w-full">Show {filteredVocabs.length} Results</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : filteredVocabs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No words found</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              Try adjusting your filters or search query to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVocabs.map((vocab, index) => (
              <VocabCard
                key={vocab.id}
                vocab={vocab}
                index={index}
                onClick={() => navigate(`/vocabularies/${vocab.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
