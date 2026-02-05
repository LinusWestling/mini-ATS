"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { useJobTemplates } from "@/src/hooks/use-job-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Textarea } from "@/components/ui/textarea";
import { useAdmin } from "@/src/providers/admin-provider";

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const { createJob } = useJobs();
  
  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;
  const { templates } = useJobTemplates(effectiveCompanyId || undefined);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const paramTitle = searchParams.get("title");
      const paramDesc = searchParams.get("description");
      if (paramTitle) setTitle(paramTitle);
      if (paramDesc) setDescription(paramDesc);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  if (!profile || !effectiveCompanyId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Inget företag valt</h2>
        <p className="text-muted-foreground mb-6">
          Du måste välja ett företag i menyn ovan innan du kan skapa ett jobb.
        </p>
        <Button onClick={() => router.push("/admin")}>Gå till Admin</Button>
      </div>
    );
  }

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setDescription(template.content);
      toast.success("Mall laddad!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createJob(
        {
          company_id: effectiveCompanyId,
          title,
          description: description || null,
          location: location || null,
          salary_min: salaryMin ? parseInt(salaryMin) : null,
          salary_max: salaryMax ? parseInt(salaryMax) : null,
        },
        {
          onSuccess: () => {
            toast.success("Jobb skapat!");
            router.push("/jobs");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte skapa jobb");
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tillbaka
      </Button>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-tight">Skapa nytt jobb</CardTitle>
          <CardDescription>Lägg till en ny jobbannons för ditt företag</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="T.ex. Senior Frontend Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Plats</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSubmitting}
                placeholder="T.ex. Stockholm, Remote"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Lön (min)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="30000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryMax">Lön (max)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="45000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Beskrivning</Label>
                {templates.length > 0 && (
                  <Select onValueChange={handleTemplateChange}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Välj mall" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[200px]"
                placeholder="Beskrivning av jobbet, krav och förmåner..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Skapar..." : "Skapa jobb"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1"
              >
                Avbryt
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <NewJobForm />
      </Suspense>
    </div>
  );
}