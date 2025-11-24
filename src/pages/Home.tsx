import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Sparkles, Zap, Brain, Loader2, BookOpen, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies } from "@/hooks/useVocabularies";
import { VocabCard } from "@/components/VocabCard";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Use the hook with search query
  // Note: The hook now returns Vocabulary[] directly, not pages
  const { data, isLoading } = useVocabularies();

  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const vocabularies = data || [];

  // Filter locally if needed (though the hook handles fetching based on search)
  // Since we are using infinite query, 'vocabularies' contains the fetched chunks.
  // If search is active, the hook fetches filtered results (or all if we didn't implement server-side search fully yet)
  // We'll add a client-side filter as a fallback for the "smooth search" requirement
  const filteredVocabs = debouncedSearch.trim()
    ? vocabularies.filter(v =>
      v.bangla.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.english.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.partOfSpeech.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : vocabularies; // Show recent words if no search

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-6 pt-12 pb-16 rounded-b-[2.5rem] shadow-lg relative overflow-hidden"
      >
        {/* Background Decorative Elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
        />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="max-w-lg mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user ? `Hi, ${user.displayName?.split(" ")[0] || "Learner"}!` : "Welcome!"}
              </h1>
              <p className="text-primary-foreground/80 font-medium">
                {user ? "Let's learn something new today." : "Start your vocabulary journey."}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-inner"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
          </div>

          {/* Search Bar or Sign In CTA */}
          {user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm transform translate-y-1" />
              <div className="relative bg-white rounded-xl shadow-lg flex items-center p-1">
                <Search className="ml-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search your vocabulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground h-12 text-base"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                onClick={() => navigate("/auth")}
                variant="secondary"
                className="w-full h-12 text-lg font-semibold shadow-lg"
              >
                Sign in to Search
              </Button>
            </motion.div>
          )}
        </div>
      </motion.header>

      <div className="max-w-lg mx-auto px-6 -mt-8 relative z-20 space-y-6">
        {searchQuery ? (
          // Search Results View
          <div className="space-y-4 pt-8">
            <h2 className="text-lg font-semibold px-1">Search Results</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredVocabs.length > 0 ? (
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
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-card rounded-xl shadow-sm border"
              >
                <div className="bg-muted/50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </motion.div>
            )}
          </div>
        ) : (
          // Default Home View
          <>
            {/* Guest View */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 border-0 shadow-lg bg-card text-center space-y-4">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Unlock Full Access</h3>
                    <p className="text-muted-foreground mb-4">
                      Sign in to search words, track your progress, and access the full vocabulary collection.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/auth")} className="w-full">
                    Sign In Now
                  </Button>
                </Card>
              </motion.div>
            )}

            {/* Quick Actions */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => navigate("/vocabularies/add")}
                  className="w-full py-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg rounded-2xl flex items-center justify-between px-6 group transition-all hover:scale-[1.02]"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-bold">Add New Word</span>
                    <span className="text-primary-foreground/80 text-xs font-normal">Expand your collection</span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                </Button>
              </motion.div>
            )}

            {/* Daily Tip */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles className="h-24 w-24 text-accent" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <Zap className="h-4 w-4 text-accent-foreground dark:text-accent" />
                    </div>
                    <h3 className="font-semibold text-foreground">Daily Tip</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Practice speaking new words aloud using the text-to-speech feature.
                    Hearing pronunciation helps with retention and builds confidence!
                  </p>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>

    </div>
  );
}
