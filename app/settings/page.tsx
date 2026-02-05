"use client";

import { useState } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useJobTemplates } from "@/src/hooks/use-job-templates";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { useAdmin } from "@/src/providers/admin-provider";
import { CompanyProfile } from "@/components/settings/company-profile";
import { RecruitmentSteps } from "@/components/settings/recruitment-steps";

export default function SettingsPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;
  
  const { templates, isLoading: templatesLoading, createTemplate, deleteTemplate } = useJobTemplates(effectiveCompanyId || undefined);

  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile || !effectiveCompanyId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Inget företag valt</h2>
          <p className="text-muted-foreground">Välj ett företag för att hantera inställningar.</p>
        </div>
      </div>
    );
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      createTemplate(
        {
          company_id: effectiveCompanyId,
          name,
          content,
        },
        {
          onSuccess: () => {
            toast.success("Mall sparad!");
            setName("");
            setContent("");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte spara mall");
          },
        }
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Inställningar</h1>
          <p className="text-muted-foreground text-lg">Hantera mallar och företagsuppgifter</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CompanyProfile companyId={effectiveCompanyId} />
            <RecruitmentSteps companyId={effectiveCompanyId} />
            
            {/* Templates List */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Dina mallar</CardTitle>
                <CardDescription>Alla sparade mallar för detta företag</CardDescription>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="text-center py-10">Laddar mallar...</div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-20 border-2 border-dashed rounded-xl">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Inga mallar ännu</h3>
                    <p className="text-muted-foreground mt-2">Skapa din första mall till höger.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{template.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.content}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Create Template Form */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-sm h-fit sticky top-6">
              <CardHeader>
                <CardTitle>Ny beskrivningsmall</CardTitle>
                <CardDescription>Skapa en återanvändbar text för dina jobbannonser</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateName">Namn på mall</Label>
                    <Input
                      id="templateName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="T.ex. Standard Frontend"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="templateContent">Beskrivning</Label>
                    <Textarea
                      id="templateContent"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Skriv din mall här..."
                      className="min-h-[200px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    Spara mall
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
