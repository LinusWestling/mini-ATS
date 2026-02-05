"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useJobs } from "@/src/hooks/use-jobs";
import { createClient } from "@/src/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { jobs, isLoading: jobsLoading } = useJobs();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const job = jobs.find((j) => j.id === jobId);

  if (jobsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Jobbet hittades inte</h2>
          <Button onClick={() => router.push("/")}>Tillbaka till start</Button>
        </div>
      </div>
    );
  }

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

      // 2. Submit Application via RPC (handles both candidate and application creation)
      const { data: candidateId, error: submitError } = await supabase
        .rpc("submit_application", {
          p_job_id: job.id,
          p_name: name,
          p_email: email,
          p_phone: phone,
          p_linkedin_url: linkedinUrl,
          p_cv_url: cv_url,
          p_company_id: job.company_id
        });

      if (submitError) throw submitError;

      toast.success("Din ansökan har skickats!");
      router.push("/");
    } catch (error: any) {
      console.error("Apply error full:", error);
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);
      toast.error(error.message || "Ett fel uppstod vid ansökan.");
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
          Tillbaka till jobbet
        </Button>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Ansök till {job.title}</CardTitle>
            <CardDescription>
              Fyll i formuläret nedan för att skicka din ansökan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Fullständigt namn</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Förnamn Efternamn"
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
                    required
                    placeholder="namn@exempel.se"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="070 123 45 67"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL (valfritt)</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/dinv-profil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv">CV (PDF, Word)</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="cv"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-border/50"
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
                            <span className="font-semibold">Klicka för att ladda upp</span> eller dra och släpp
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
                    />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skickar ansökan...
                  </>
                ) : (
                  "Skicka ansökan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
