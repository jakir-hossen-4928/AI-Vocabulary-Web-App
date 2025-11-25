import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Zap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useVocabularies } from "@/hooks/useVocabularies";
import { VocabCard } from "@/components/VocabCard";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { data, isLoading } = useVocabularies();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const loadFavorites = () => {
      const saved = localStorage.getItem("favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    };
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id)
        ? prev.filter(favId => favId !== id)
        : [...prev, id];

      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      window.dispatchEvent(new Event('storage'));
      return newFavorites;
    });
  }, []);

  const vocabularies = data || [];

  const filteredVocabs = debouncedSearch.trim()
    ? vocabularies.filter(v =>
      v.bangla.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.english.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      v.partOfSpeech.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    : vocabularies.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Reduced Height */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-600">
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-3xl"
          />
        </div>

        {/* Reduced padding from py-8 sm:py-16 lg:py-20 to py-6 sm:py-10 lg:py-12 */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 sm:mb-6"
          >
            {/* Welcome Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full mb-3 sm:mb-4"
            >
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                Welcome back, {user?.displayName?.split(" ")[0] || "Learner"}! 👋
              </span>
            </motion.div>

            {/* Main Heading - Reduced margins */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight px-4">
              Continue Your
              <motion.span
                className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300"
                animate={{
                  backgroundPosition: ["0%", "100%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
                style={{
                  backgroundSize: "200% 100%"
                }}
              >
                Learning Journey
              </motion.span>
            </h1>

            {/* Reduced text size and margins */}
            <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto px-4">
              Search for vocabulary, track your progress, and master new words every day.
            </p>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ delay: 0.2 }}
              className="relative max-w-2xl mx-auto px-4"
            >
              <motion.div
                animate={isSearchFocused ? {
                  opacity: 0.3,
                } : {
                  opacity: 0.2,
                }}
                className="absolute inset-0 bg-white/20 rounded-2xl blur-sm transform translate-y-1"
              />
              <div className="relative bg-white rounded-2xl shadow-2xl flex items-center p-2 border-2 transition-all duration-300"
                style={{
                  borderColor: isSearchFocused ? 'rgba(59, 130, 246, 0.5)' : 'transparent'
                }}
              >
                <Search className="ml-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search your vocabulary..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground h-10 sm:h-12 text-sm sm:text-base flex-1 min-w-0"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Results or Recent Vocabularies */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-6 w-6 text-primary" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-lg sm:text-xl font-bold px-4 sm:px-0">
                {searchQuery.trim() ? "Search Results" : "Recent Vocabularies"}
              </h2>

              {filteredVocabs.length > 0 ? (
                <motion.div
                  className="grid gap-3 px-4 sm:px-0"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {filteredVocabs.map((vocab, index) => (
                      <motion.div
                        key={vocab.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                      >
                        <VocabCard
                          vocab={vocab}
                          index={index}
                          isFavorite={favorites.includes(vocab.id)}
                          onToggleFavorite={toggleFavorite}
                          onClick={() => navigate(`/vocabularies/${vocab.id}`)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-4 sm:px-0"
                >
                  <Card className="p-6 sm:p-8 text-center border-2 border-dashed border-muted">
                    <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-semibold mb-2">No matches found</h3>
                    <p className="text-muted-foreground text-sm">Try a different search term</p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Tip - Reduced margins */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-10 px-4 sm:px-0"
        >
          <Card className="p-4 sm:p-6 border-0 shadow-lg bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 right-0 p-2 opacity-10"
            >
              <Sparkles className="h-16 w-16 sm:h-20 sm:w-20 text-accent" />
            </motion.div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  whileHover={{ rotate: 15 }}
                  className="p-1.5 sm:p-2 rounded-lg bg-accent/20"
                >
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground dark:text-accent" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold">Daily Learning Tip</h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Practice speaking new words aloud using the text-to-speech feature.
                Hearing pronunciation helps with retention and builds confidence!
              </p>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
}