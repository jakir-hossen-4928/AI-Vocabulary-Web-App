import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GrammarImage } from "@/types/grammar";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Loader2, ZoomIn } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { motion } from "framer-motion";

export default function Grammar() {
  const [images, setImages] = useState<GrammarImage[]>([]);
  const [loading, setLoading] = useState(true);

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
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : images.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center shadow-sm border-dashed">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Gallery Empty
              </h2>
              <p className="text-muted-foreground">
                Check back soon for new content!
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Dialog>
                  <DialogTrigger asChild>
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
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl w-full p-0 bg-black/95 border-0 h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col items-center justify-center focus:outline-none">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                      <img
                        src={img.imageUrl}
                        alt={img.title}
                        className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
                      <h3 className="text-lg font-semibold text-center">{img.title}</h3>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        )}
      </div>


      <BottomNav />
    </div>
  );
}
