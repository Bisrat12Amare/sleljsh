import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateChild } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useChildContext } from "@/hooks/use-child";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const addChildSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  gender: z.enum(["M", "F"], { required_error: "Please select a gender" }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type AddChildFormValues = z.infer<typeof addChildSchema>;

export default function AddChild() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { setSelectedChildId } = useChildContext();
  const { toast } = useToast();
  const createChildMutation = useCreateChild();

  const form = useForm<AddChildFormValues>({
    resolver: zodResolver(addChildSchema),
    defaultValues: { name: "", gender: "M", dateOfBirth: "" },
  });

  const onSubmit = (data: AddChildFormValues) => {
    if (!user) return;
    
    createChildMutation.mutate(
      { data: { ...data, userId: user.id } },
      {
        onSuccess: (res) => {
          setSelectedChildId(res.id);
          toast({ title: "Profile created!", description: `${res.name}'s profile has been set up.` });
          setLocation("/dashboard");
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create child profile.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="p-6 max-w-xl mx-auto py-12">
        <Card className="border-border/50 shadow-lg bg-card/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">Add Child Profile</CardTitle>
            <CardDescription>Enter your child's details to personalize their health tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Name</Label>
                <Input 
                  id="name" 
                  placeholder="First name" 
                  {...form.register("name")}
                  className="bg-background/50"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup 
                  defaultValue="M" 
                  onValueChange={(val) => form.setValue("gender", val as "M" | "F")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="gender-m" />
                    <Label htmlFor="gender-m" className="cursor-pointer">Boy</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="F" id="gender-f" />
                    <Label htmlFor="gender-f" className="cursor-pointer">Girl</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.gender && (
                  <p className="text-sm text-destructive">{form.formState.errors.gender.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input 
                  id="dateOfBirth" 
                  type="date" 
                  max={new Date().toISOString().split("T")[0]}
                  {...form.register("dateOfBirth")}
                  className="bg-background/50"
                />
                {form.formState.errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{form.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={createChildMutation.isPending}>
                {createChildMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
