"use client";

import { useState, useEffect } from "react";
import { useCompanies } from "@/src/hooks/use-companies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

interface AutoReplySettingsProps {
  companyId: string;
}

export function AutoReplySettings({ companyId }: AutoReplySettingsProps) {
  const { companies, updateCompany } = useCompanies();
  
  const company = companies.find((c) => c.id === companyId);
  const [enabled, setEnabled] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setEnabled(company.auto_reply_enabled ?? false);
      setSubject(company.auto_reply_subject || "Tack för din ansökan!");
      setBody(company.auto_reply_body || "Hej! Tack för att du har sökt tjänsten. Vi återkommer så snart vi har tittat på din ansökan.");
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      updateCompany(
        { 
          id: companyId, 
          auto_reply_enabled: enabled, 
          auto_reply_subject: subject, 
          auto_reply_body: body 
        },
        {
          onSuccess: () => {
            toast.success("Inställningar för autosvar sparade!");
          },
          onError: (error) => {
            toast.error("Kunde inte spara inställningar.");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Ett fel uppstod.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!company) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Automatiska Svarsmeddelanden
        </CardTitle>
        <CardDescription>
          Skicka ett automatiskt bekräftelsemejl till kandidater när de skickar in en ansökan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-2">
            <input
              id="autoReplyEnabled"
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="autoReplyEnabled" className="cursor-pointer">
              Aktivera automatiska svarsmeddelanden
            </Label>
          </div>

          <div className={`space-y-4 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-2">
              <Label htmlFor="subject">Ämnesrad</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tack för din ansökan!"
                disabled={!enabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Meddelande</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Skriv meddelandet här..."
                className="min-h-[150px]"
                disabled={!enabled}
              />
              <p className="text-xs text-muted-foreground">
                Detta meddelande skickas direkt efter att ansökan har tagits emot.
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Spara inställningar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
