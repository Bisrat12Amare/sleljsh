import { useState } from "react";
import { Layout } from "@/components/layout";
import { useChildContext } from "@/hooks/use-child";
import { useGetVaccinations, useGetVaccinationSchedule, useUpdateVaccination, useCreateVaccination } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Syringe, CheckCircle2, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Vaccination() {
  const { selectedChildId } = useChildContext();
  const { toast } = useToast();
  
  const { data: records, isLoading: recordsLoading, refetch } = useGetVaccinations(
    { childId: selectedChildId || undefined },
    { query: { enabled: !!selectedChildId } }
  );

  const { data: schedule, isLoading: scheduleLoading } = useGetVaccinationSchedule(
    { query: { enabled: !!selectedChildId } }
  );

  const updateMutation = useUpdateVaccination();
  const createMutation = useCreateVaccination();

  if (!selectedChildId) {
    return (
      <Layout>
        <div className="p-6 flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">Please select or add a child to view vaccinations.</p>
        </div>
      </Layout>
    );
  }

  const markAsCompleted = (recordId: number) => {
    updateMutation.mutate(
      { 
        id: recordId, 
        data: { 
          status: "completed", 
          completedDate: new Date().toISOString().split('T')[0] 
        } 
      },
      {
        onSuccess: () => {
          toast({ title: "Updated!", description: "Vaccination marked as completed." });
          refetch();
        }
      }
    );
  };

  const addFromSchedule = (item: any) => {
    createMutation.mutate(
      {
        data: {
          childId: selectedChildId,
          vaccineName: item.vaccineName,
          vaccineNameAm: item.vaccineNameAm,
          scheduledAge: item.scheduledAge,
          scheduledDate: null,
          notes: item.description
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Added", description: "Vaccine added to tracker." });
          refetch();
        }
      }
    );
  };

  // Find which schedule items are already in records
  const existingNames = new Set(records?.map(r => r.vaccineName));

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Syringe className="w-8 h-8 text-primary" />
              Vaccination Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Track Ethiopia EPI (Expanded Programme on Immunization) schedule.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Tracker List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold">Child's Record</h2>
            
            {recordsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : records && records.length > 0 ? (
              <motion.div className="space-y-4" initial={{opacity:0}} animate={{opacity:1}}>
                {records.map(record => (
                  <Card key={record.id} className={`border-border/50 transition-colors ${record.status === 'completed' ? 'bg-card/50' : 'bg-card'}`}>
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          record.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-primary/20 text-primary'
                        }`}>
                          {record.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{record.vaccineName}</h3>
                          <p className="font-amharic text-muted-foreground text-sm mb-1" dir="auto">{record.vaccineNameAm}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Age: {record.scheduledAge}</span>
                            {record.completedDate && (
                              <span className="text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3"/> Done: {format(new Date(record.completedDate), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {record.status !== 'completed' && (
                        <Button 
                          variant="outline" 
                          className="shrink-0"
                          onClick={() => markAsCompleted(record.id)}
                          disabled={updateMutation.isPending}
                        >
                          Mark Done
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            ) : (
              <div className="text-center p-8 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground mb-4">No vaccination records yet.</p>
                <p className="text-sm">Add from the official schedule to start tracking.</p>
              </div>
            )}
          </div>

          {/* Official Schedule */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">EPI Schedule</h2>
            
            <Card className="bg-card border-border/50 h-[calc(100vh-250px)] flex flex-col">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-lg">Standard Vaccines</CardTitle>
                <CardDescription>Click + to add to tracker</CardDescription>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {scheduleLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : schedule ? (
                  schedule.map((item, i) => {
                    const isAdded = existingNames.has(item.vaccineName);
                    return (
                      <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/50 bg-background/50">
                        <div>
                          <p className="font-semibold text-sm">{item.vaccineName}</p>
                          <p className="text-xs text-primary">{item.scheduledAge}</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAdded ? "ghost" : "secondary"}
                          className={`shrink-0 h-8 ${isAdded ? "opacity-50" : ""}`}
                          disabled={isAdded || createMutation.isPending}
                          onClick={() => addFromSchedule(item)}
                        >
                          {isAdded ? "Added" : "+ Add"}
                        </Button>
                      </div>
                    );
                  })
                ) : null}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
}
