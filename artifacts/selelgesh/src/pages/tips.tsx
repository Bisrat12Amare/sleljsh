import { useState } from "react";
import { Layout } from "@/components/layout";
import { useGetTips, useGetDailyTip } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, Moon, Utensils, Activity, Brain } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sleep: Moon,
  nutrition: Utensils,
  play: Activity,
  habits: Brain,
};

export default function Tips() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const { data: dailyTip, isLoading: dailyLoading } = useGetDailyTip();
  const { data: allTips, isLoading: tipsLoading } = useGetTips({
    category: activeCategory !== "all" ? activeCategory : undefined
  });

  const categories = ["all", "sleep", "nutrition", "play", "habits"];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-primary" />
            Parenting Tips
          </h1>
          <p className="text-muted-foreground mt-2">
            Culturally grounded advice for raising healthy, happy children.
          </p>
        </header>

        {/* Featured Daily Tip */}
        <section>
          {dailyLoading ? (
            <Skeleton className="h-48 w-full rounded-xl" />
          ) : dailyTip ? (
            <Card className="bg-primary text-primary-foreground border-none overflow-hidden relative">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[64px] pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center gap-2 mb-4 text-primary-foreground/80 font-medium uppercase tracking-wider text-sm">
                  <Lightbulb className="w-4 h-4" /> Featured Today
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-3">{dailyTip.title}</h2>
                    <p className="text-primary-foreground/90 leading-relaxed">{dailyTip.content}</p>
                  </div>
                  <div className="border-t md:border-t-0 md:border-l border-primary-foreground/20 pt-6 md:pt-0 md:pl-8">
                    <h2 className="text-2xl font-bold mb-3 font-amharic" dir="auto">{dailyTip.titleAm}</h2>
                    <p className="text-primary-foreground/90 leading-relaxed font-amharic" dir="auto">{dailyTip.contentAm}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </section>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-card border border-border text-foreground hover:bg-accent"
              }`}
            >
              {cat === "all" ? "All Tips" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Tips Grid */}
        <section>
          {tipsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : allTips && allTips.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial={{opacity: 0}}
              animate={{opacity: 1}}
            >
              {allTips.map((tip, i) => {
                const Icon = CATEGORY_ICONS[tip.category] || Lightbulb;
                return (
                  <Card key={tip.id} className="bg-card border-border/50 h-full flex flex-col">
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <CardTitle className="text-xl leading-tight">{tip.title}</CardTitle>
                      <div className="bg-primary/20 text-primary p-2 rounded-lg shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-muted-foreground text-sm mb-6 flex-1">{tip.content}</p>
                      
                      <div className="pt-4 border-t border-border/50 mt-auto">
                        <h3 className="font-amharic font-bold text-lg mb-2 text-primary" dir="auto">{tip.titleAm}</h3>
                        <p className="font-amharic text-muted-foreground text-sm" dir="auto">{tip.contentAm}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center p-12 bg-card rounded-xl border border-border">
              <p className="text-muted-foreground">No tips found for this category.</p>
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}
