import { useState } from "react";
import { Layout } from "@/components/layout";
import { useChildContext } from "@/hooks/use-child";
import { useGetWeeklyScreenTimeSummary, useCreateScreenTimeRecord } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { MonitorSmartphone, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";

const recordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  minutes: z.coerce.number().min(0),
  limitMinutes: z.coerce.number().min(30).default(120),
});

type RecordFormValues = z.infer<typeof recordSchema>;

export default function ScreenTime() {
  const { selectedChildId } = useChildContext();
  const { toast } = useToast();
  
  const { data: summary, isLoading, refetch } = useGetWeeklyScreenTimeSummary(
    { childId: selectedChildId || undefined },
    { query: { enabled: !!selectedChildId } }
  );

  const createMutation = useCreateScreenTimeRecord();

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      minutes: 0,
      limitMinutes: 120
    }
  });

  if (!selectedChildId) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">Please select or add a child to view screen time.</p>
        </div>
      </Layout>
    );
  }

  const onSubmit = (data: RecordFormValues) => {
    createMutation.mutate(
      {
        data: {
          childId: selectedChildId,
          ...data
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Logged", description: "Screen time recorded." });
          form.setValue("minutes", 0); // Keep date and limit
          refetch();
        }
      }
    );
  };

  const chartData = summary?.records.map(r => ({
    day: format(parseISO(r.date), 'EEE'),
    minutes: r.minutes,
    limit: r.limitMinutes,
    exceeded: r.exceeded
  })) || [];

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <MonitorSmartphone className="w-8 h-8 text-primary" />
            Screen Time
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor digital wellbeing and enforce healthy limits.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Log Usage</CardTitle>
                <CardDescription>Record daily screen time</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" {...form.register("date")} className="bg-background/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Clock className="w-4 h-4"/> Usage (Minutes)</Label>
                    <Input type="number" {...form.register("minutes")} className="bg-background/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Limit (Minutes)</Label>
                    <Input type="number" {...form.register("limitMinutes")} className="bg-background/50"/>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                    Save Log
                  </Button>
                </form>
              </CardContent>
            </Card>

            {summary && summary.daysExceeded > 0 && (
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive">Limit Exceeded</h4>
                    <p className="text-sm text-destructive/80">
                      The daily limit was exceeded on {summary.daysExceeded} days this week. 
                      Try implementing tech-free zones before bedtime.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-6 text-center">
                  <h3 className="text-muted-foreground text-sm font-medium mb-2">Weekly Total</h3>
                  <p className="text-3xl font-bold text-primary">
                    {isLoading ? <Skeleton className="h-9 w-16 mx-auto"/> : `${Math.floor((summary?.weekTotal || 0) / 60)}h ${(summary?.weekTotal || 0) % 60}m`}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-6 text-center">
                  <h3 className="text-muted-foreground text-sm font-medium mb-2">Daily Average</h3>
                  <p className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-9 w-16 mx-auto"/> : `${summary?.dailyAverage || 0}m`}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="day" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          cursor={{fill: '#222'}}
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.exceeded ? "hsl(var(--destructive))" : "hsl(var(--primary))"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data recorded this week.
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/> Within limit</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"/> Exceeded limit</div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
