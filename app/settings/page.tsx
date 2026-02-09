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
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAdmin } from "@/src/providers/admin-provider";
import { CompanyProfile } from "@/components/settings/company-profile";
import { RecruitmentSteps } from "@/components/settings/recruitment-steps";
import { AutoReplySettings } from "@/components/settings/auto-reply-settings";
import { TeamManagement } from "@/components/settings/team-management";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/layout/loading-state";
import { EmptyState } from "@/components/layout/empty-state";

function CollapsibleSection({ title, description, children, defaultOpen = false }: { title: string, description?: string, children: React.ReactNode, defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors flex flex-row items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Button variant="ghost" size="sm">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

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
        <LoadingState fullPage message="Laddar inställningar..." />
      </div>
    );
  }

  if (!profile || !effectiveCompanyId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <EmptyState
            title="Inget företag valt"
            description="Välj ett företag i admin-panelen för att hantera dess inställningar."
          />
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
        <PageHeader
          title="Inställningar"
          description="Hantera mallar och företagsuppgifter"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <CollapsibleSection title="Företagsprofil" description="Namn, beskrivning och logotyp" defaultOpen={true}>
              <CompanyProfile companyId={effectiveCompanyId} />
            </CollapsibleSection>

            <CollapsibleSection title="Notifieringar" description="Inställningar för e-post och aviseringar">
              <NotificationSettings />
            </CollapsibleSection>

            <CollapsibleSection title="Autosvar" description="Automatiska e-postmeddelanden till kandidater">
              <AutoReplySettings companyId={effectiveCompanyId} />
            </CollapsibleSection>

            <CollapsibleSection title="Team" description="Hantera medarbetare och inbjudningar">
              <TeamManagement companyId={effectiveCompanyId} />
            </CollapsibleSection>

            <CollapsibleSection title="Rekryteringssteg" description="Anpassa stegen i din Kanban-tavla">
              <RecruitmentSteps companyId={effectiveCompanyId} />
            </CollapsibleSection>
            
            <CollapsibleSection title="Jobbannons-mallar" description="Alla sparade mallar för detta företag">
              {templatesLoading ? (
                <LoadingState message="Laddar mallar..." />
              ) : templates.length === 0 ? (
                <EmptyState
                  title="Inga mallar ännu"
                  description="Skapa din första mall till höger för att snabba upp ditt arbete."
                />
              ) : (
                <div className="grid gap-4 mt-4">
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
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CollapsibleSection>
          </div>

          {/* Create Template Form */}
          <div className="lg:col-span-1">
            <Card className="border-border/50 shadow-sm h-fit sticky top-6">
              <CardHeader>
                <CardTitle>Ny Jobbannons-mall</CardTitle>
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
                    <Label htmlFor="templateContent">Innehåll</Label>
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
