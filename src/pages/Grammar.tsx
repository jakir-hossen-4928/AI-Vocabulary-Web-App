import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export default function Grammar() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1">Grammar</h1>
          <p className="text-primary-foreground/80 text-sm">
            Master English grammar for IELTS
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-6">
        <Card className="p-12 text-center shadow-hover">
          <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Coming Soon
          </h2>
          <p className="text-muted-foreground">
            Grammar lessons and exercises will be available here
          </p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
