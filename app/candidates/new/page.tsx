"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, Plus, Trash2, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";

export default function NewCandidatePage() {
  const router = useRouter();
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const { createCandidate } = useCandidates();
  const supabase = createClient();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [extraFields, setExtraFields] = useState<{ label: string, value: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

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
          <p className="text-muted-foreground mb-6">
            Du måste välja ett företag i menyn ovan innan du kan lägga till en kandidat.
          </p>
          <Button onClick={() => router.push("/admin")}>Gå till Admin</Button>
        </div>
      </div>
    );
  }

  const handleAddExtraField = () => {
    setExtraFields([...extraFields, { label: "", value: "" }]);
  };

  const handleRemoveExtraField = (index: number) => {
    setExtraFields(extraFields.filter((_, i) => i !== index));
  };

  const handleExtraFieldChange = (index: number, field: 'label' | 'value', val: string) => {
    const newFields = [...extraFields];
    newFields[index][field] = val;
    setExtraFields(newFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let cv_url = "";

      // 1. Upload CV if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `cvs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("cvs")
          .getPublicUrl(filePath);
        
        cv_url = publicUrl;
      }

      // 2. Create Candidate
      createCandidate(
        {
          company_id: effectiveCompanyId,
          name,
          email: email || null,
          phone: phone || null,
          linkedin_url: linkedinUrl || null,
          cv_url: cv_url || null,
          extra_fields: extraFields.filter(f => f.label.trim() && f.value.trim()),
        },
        {
          onSuccess: () => {
            toast.success("Kandidat tillagd!");
            router.push("/candidates");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte lägga till kandidat");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Ett oväntat fel uppstod");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
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
            <CardTitle className="text-2xl font-bold tracking-tight">Lägg till kandidat</CardTitle>
            <CardDescription>
              Lägg till en ny kandidat manuellt {profile.role === "admin" ? "(som Admin)" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="T.ex. Anna Andersson"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="anna.andersson@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="+46 70 123 45 67"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://www.linkedin.com/in/anna-andersson"
                />
              </div>

              {/* Extra Fields Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Extra information</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddExtraField} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Lägg till fält
                  </Button>
                </div>
                
                {extraFields.map((field, index) => (
                  <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <Input
                      placeholder="Etikett (t.ex. GitHub)"
                      value={field.label}
                      onChange={(e) => handleExtraFieldChange(index, 'label', e.target.value)}
                      className="flex-1"
                      disabled={isSubmitting}
                    />
                    <Input
                      placeholder="Värde"
                      value={field.value}
                      onChange={(e) => handleExtraFieldChange(index, 'value', e.target.value)}
                      className="flex-2"
                      disabled={isSubmitting}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveExtraField(index)}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* CV Upload */}
              <div className="space-y-2 pt-2">
                <Label htmlFor="cv">CV (PDF, Word)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="cv"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors border-border/50"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {file ? (
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <FileText className="h-5 w-5" />
                          {file.name}
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Klicka för att ladda upp CV</span>
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (Max 10MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="cv"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Lägger till...
                    </>
                  ) : "Lägg till kandidat"}
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
    </div>
  );
}
