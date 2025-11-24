import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, Loader2, ZoomIn } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function Grammar() {
  const [images, setImages] = useState<GrammarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [api, setApi] = useState<CarouselApi>();

  const filteredImages = images.filter((img) =>
    img.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!api) {
      return;
    }
    api.scrollTo(selectedImageIndex);
  }, [api, selectedImageIndex, isDialogOpen]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, "grammar_images"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedImages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GrammarImage[];
        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching grammar images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6"
      >
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Grammar Gallery</h1>
          <p className="text-primary-foreground/80 text-sm">
            Visual guides for mastering English
          </p>
        </div>
      </motion.header>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grammar topics..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center shadow-sm border-dashed">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "No matches found" : "Gallery Empty"}
              </h2>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Check back soon for new content!"}
              </p>
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    setSelectedImageIndex(index);
                    setIsDialogOpen(true);
                  }}
                >
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group bg-muted">
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 flex flex-col justify-end p-3">
                      <h3 className="text-white text-xs md:text-sm font-medium line-clamp-2 leading-tight">
                        {img.title}
                      </h3>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-[100vw] w-full h-[100dvh] md:h-[90vh] md:max-w-5xl p-0 bg-black/95 border-0 flex flex-col items-center justify-center focus:outline-none">
                <div className="relative w-full h-full flex items-center justify-center">
                  <Carousel
                    setApi={setApi}
                    opts={{
                      startIndex: selectedImageIndex,
                      loop: true,
                    }}
                    className="w-full h-full"
                  >
                    <CarouselContent className="h-full -ml-0">
                      {filteredImages.map((img) => (
                        <CarouselItem key={img.id} className="h-full pl-0 flex items-center justify-center relative">
                          <div className="relative w-full h-full flex items-center justify-center p-4">
                            <img
                              src={img.imageUrl}
                              alt={img.title}
                              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            />
                          </div>
                          <div className="absolute bottom-8 left-0 right-0 p-4 text-center z-10">
                            <h3 className="text-white text-lg font-semibold bg-black/50 inline-block px-4 py-2 rounded-full backdrop-blur-sm">
                              {img.title}
                            </h3>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 bg-black/50 border-none text-white hover:bg-black/70 hidden md:flex" />
                    <CarouselNext className="right-4 bg-black/50 border-none text-white hover:bg-black/70 hidden md:flex" />
                  </Carousel>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>


      <BottomNav />
    </div>
  );
}
