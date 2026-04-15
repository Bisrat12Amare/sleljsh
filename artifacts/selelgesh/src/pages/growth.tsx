import { useState } from "react";
import { Layout } from "@/components/layout";
import { useChildContext } from "@/hooks/use-child";
import { useGetGrowthRecords, useCreateGrowthRecord } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart as ChartIcon, Scale, Ruler } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

const recordSchema = z.object({
  date: z.string().min(1, "Date is required"),
  heightCm: z.coerce.number().min(30).max(200),
  weightKg: z.coerce.number().min(1).max(100),
  ageMonths: z.coerce.number().min(0),
});

type RecordFormValues = z.infer<typeof recordSchema>;

export default function Growth() {
  const { selectedChildId } = useChildContext();
  const { toast } = useToast();
  
  const { data: records, isLoading, refetch } = useGetGrowthRecords(
    { childId: selectedChildId || undefined },
    { query: { enabled: !!selectedChildId } }
  );

  const createMutation = useCreateGrowthRecord();

  const form = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: { 
      date: new Date().toISOString().split('T')[0],
      heightCm: 0,
      weightKg: 0,
      ageMonths: 0
    }
  });

  if (!selectedChildId) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">Please select or add a child to view growth records.</p>
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
          toast({ title: "Recorded", description: "Growth record saved successfully." });
          form.reset({
            date: new Date().toISOString().split('T')[0],
            heightCm: 0,
            weightKg: 0,
            ageMonths: 0
          });
          refetch();
        }
      }
    );
  };

  // Prepare chart data
  const chartData = [...(records || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(r => ({
    date: format(new Date(r.date), 'MMM yy'),
    weight: r.weightKg,
    height: r.heightCm,
    age: r.ageMonths
  }));

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ChartIcon className="w-8 h-8 text-primary" />
            Growth Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor weight and height over time.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Record Form */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Add Record</CardTitle>
                <CardDescription>Log new measurements</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" {...form.register("date")} className="bg-background/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Age (Months)</Label>
                    <Input type="number" {...form.register("ageMonths")} className="bg-background/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Scale className="w-4 h-4"/> Weight (kg)</Label>
                    <Input type="number" step="0.1" {...form.register("weightKg")} className="bg-background/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Ruler className="w-4 h-4"/> Height (cm)</Label>
                    <Input type="number" step="0.1" {...form.register("heightCm")} className="bg-background/50"/>
                  </div>
                  <Button type="submit" className="w-full mt-4" disabled={createMutation.isPending}>
                    Save Record
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Weight Progression (kg)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{r: 4, fill: "hsl(var(--primary))"}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available. Add a record to see the chart.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Height Progression (cm)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : chartData.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="height" stroke="#4ade80" strokeWidth={3} dot={{r: 4, fill: "#4ade80"}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No data available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
