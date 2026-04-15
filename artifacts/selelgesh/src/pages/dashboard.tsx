import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useChildContext } from "@/hooks/use-child";
import { useGetDashboardSummary, useGetChildren } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe, MonitorSmartphone, LineChart, Apple, ArrowRight, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { selectedChildId, setSelectedChildId } = useChildContext();
  
  const { data: children, isLoading: childrenLoading } = useGetChildren();

  // If we have children but no selected child, select the first one
  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId, setSelectedChildId]);

  const { data: summary, isLoading: summaryLoading } = useGetDashboardSummary(
    { childId: selectedChildId || undefined },
    { query: { enabled: !!selectedChildId } }
  );

  // If still loading initial stuff
  if (childrenLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state - no children
  if (children && children.length === 0) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl font-bold">ስ</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Selelgesh, {user?.name}!</h2>
          <p className="text-muted-foreground mb-8">
            To start tracking vaccinations, growth, and nutrition, you need to add your child's profile first.
          </p>
          <Button size="lg" onClick={() => setLocation("/add-child")} className="w-full">
            Add Child Profile
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground">
            {summary?.child ? `How is ${summary.child.name} today?` : "Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-1">Here is your daily health overview.</p>
        </header>

        {summaryLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        ) : summary ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.1 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Vaccination Card */}
              <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setLocation("/vaccination")}>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                    <Syringe className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">{summary.upcomingVaccinations}</h3>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Vaccines</p>
                </CardContent>
              </Card>

              {/* Growth Card */}
              <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setLocation("/growth")}>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold">
                    {summary.latestGrowth ? `${summary.latestGrowth.weightKg}kg` : "No data"}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">Latest Weight</p>
                </CardContent>
              </Card>

              {/* Screen Time Card */}
              <Card className={`border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer ${summary.screenTimeExceeded ? 'bg-destructive/10 border-destructive/30' : 'bg-card'}`} onClick={() => setLocation("/screentime")}>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${summary.screenTimeExceeded ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
                    <MonitorSmartphone className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold">{summary.todayScreenTime}m</h3>
                    {summary.screenTimeExceeded && (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Screen Time</p>
                </CardContent>
              </Card>

              {/* Nutrition Card */}
              <Card className="bg-card border-border/50 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setLocation("/nutrition")}>
                <CardContent className="p-6 flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                    <Apple className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold capitalize">{summary.recentNutritionPlan || "Ready"}</h3>
                  <p className="text-sm font-medium text-muted-foreground">Meal Plan Status</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Tip */}
              <div className="lg:col-span-2">
                <Card className="h-full bg-gradient-to-br from-card to-card/50 border-border/50 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[64px] pointer-events-none" />
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" /> Tip of the Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summary.dailyTip ? (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-semibold mb-1">{summary.dailyTip.title}</h4>
                          <p className="text-muted-foreground">{summary.dailyTip.content}</p>
                        </div>
                        <div className="pt-4 border-t border-border/30">
                          <h4 className="text-lg font-semibold mb-1 font-amharic" dir="auto">{summary.dailyTip.titleAm}</h4>
                          <p className="text-muted-foreground font-amharic" dir="auto">{summary.dailyTip.contentAm}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tip available for today.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="font-semibold text-lg">Quick Actions</h3>
                
                <Button variant="outline" className="w-full justify-between h-14 bg-card hover:bg-accent border-border/50" onClick={() => setLocation("/screentime")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary p-2 rounded-md">
                      <MonitorSmartphone className="w-4 h-4" />
                    </div>
                    <span>Log Screen Time</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Button>
                
                <Button variant="outline" className="w-full justify-between h-14 bg-card hover:bg-accent border-border/50" onClick={() => setLocation("/growth")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary p-2 rounded-md">
                      <LineChart className="w-4 h-4" />
                    </div>
                    <span>Update Growth</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Button>

                <Button variant="outline" className="w-full justify-between h-14 bg-card hover:bg-accent border-border/50" onClick={() => setLocation("/nutrition")}>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 text-primary p-2 rounded-md">
                      <Apple className="w-4 h-4" />
                    </div>
                    <span>View Meal Plan</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
            
          </motion.div>
        ) : null}
      </div>
    </Layout>
  );
}
