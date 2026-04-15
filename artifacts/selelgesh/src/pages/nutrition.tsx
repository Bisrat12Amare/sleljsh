import { Layout } from "@/components/layout";
import { useChildContext } from "@/hooks/use-child";
import { useGetMealPlan, useGetChild } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Apple, Sunrise, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function Nutrition() {
  const { selectedChildId } = useChildContext();
  
  const { data: child } = useGetChild(selectedChildId || 0, {
    query: { enabled: !!selectedChildId }
  });

  const { data: mealPlan, isLoading } = useGetMealPlan(
    { childId: selectedChildId || undefined },
    { query: { enabled: !!selectedChildId } }
  );

  if (!selectedChildId) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">Please select or add a child to view nutrition plans.</p>
        </div>
      </Layout>
    );
  }

  const renderMealSection = (title: string, icon: React.ReactNode, meals: any[] | undefined) => {
    if (!meals || meals.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
          {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="bg-card border-border/50 overflow-hidden hover:border-primary/50 transition-colors">
              <div className="h-2 bg-primary/20 w-full" />
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg">{meal.foodName}</h4>
                  {meal.calories && (
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      {meal.calories} kcal
                    </span>
                  )}
                </div>
                <h5 className="font-amharic text-primary font-medium mb-3" dir="auto">{meal.foodNameAm}</h5>
                <p className="text-sm text-muted-foreground leading-relaxed">{meal.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Apple className="w-8 h-8 text-primary" />
              Nutrition Plan
            </h1>
            <p className="text-muted-foreground mt-2">
              Ethiopian-inspired healthy meals tailored for {child ? child.name : "your child"}'s age group.
            </p>
          </div>
          {mealPlan && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-semibold">
              Age Group: {mealPlan.ageGroup}
            </div>
          )}
        </header>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        ) : mealPlan ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            {renderMealSection("Breakfast", <Sunrise className="w-6 h-6 text-orange-400" />, mealPlan.breakfast)}
            {renderMealSection("Lunch", <Sun className="w-6 h-6 text-yellow-500" />, mealPlan.lunch)}
            {renderMealSection("Dinner", <Moon className="w-6 h-6 text-indigo-400" />, mealPlan.dinner)}
          </motion.div>
        ) : (
          <div className="text-center p-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No meal plan available for this age group yet.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
