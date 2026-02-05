"use client";

import { useState, useEffect } from "react";
import { useCompanies } from "@/src/hooks/use-companies";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, ImageIcon } from "lucide-react";

interface CompanyProfileProps {
  companyId: string;
}

export function CompanyProfile({ companyId }: CompanyProfileProps) {
  const { companies, updateCompany } = useCompanies();
  const supabase = createClient();
  
  const company = companies.find((c) => c.id === companyId);
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setDescription(company.description || "");
    }
  }, [company]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let logo_url = company?.logo_url;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${companyId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        console.log("Uploading logo to storage...");
        const { error: uploadError } = await supabase.storage
          .from("company_logos")
          .upload(filePath, logoFile);

        if (uploadError) {
          console.error("Logo upload error:", uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("company_logos")
          .getPublicUrl(filePath);
        
        logo_url = publicUrl;
        console.log("Logo uploaded, public URL:", logo_url);
      }

      console.log("Updating company with data:", { id: companyId, description, logo_url });
      updateCompany(
        { id: companyId, description, logo_url },
        {
          onSuccess: (data) => {
            console.log("Company update success:", data);
            toast.success("Företagsprofil uppdaterad!");
          },
          onError: (error) => {
            console.error("Company update error hook:", error);
            toast.error("Kunde inte spara profil.");
          },
        }
      );
    } catch (error: any) {
      console.error("Detailed handleSave error:", error);
      toast.error(error.message || "Ett fel uppstod.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!company) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle>Företagsprofil</CardTitle>
        <CardDescription>Hantera hur ditt företag visas för kandidater</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label>Logotyp</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden relative">
                {(logoFile || company.logo_url) ? (
                  <img 
                    src={logoFile ? URL.createObjectURL(logoFile) : company.logo_url!} 
                    alt="Logo preview" 
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Rekommenderad storlek: 200x200px. PNG eller JPG.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compDesc">Om företaget</Label>
            <Textarea
              id="compDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Berätta om er kultur, vision och vad ni erbjuder..."
              className="min-h-[150px]"
            />
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Spara ändringar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
