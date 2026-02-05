"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { useApplications } from "@/src/hooks/use-applications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Linkedin, FileText, ExternalLink, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const { profile, isLoading: authLoading } = useAuth();
  const { candidates } = useCandidates(profile?.company_id || undefined);
  const { applications, isLoading: appsLoading } = useApplications(undefined, profile?.company_id || undefined);

  const candidate = candidates.find((c) => c.id === candidateId);
  const candidateApplications = applications.filter((app) => app.candidate_id === candidateId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Kandidat hittades inte</h2>
          <Button onClick={() => router.push("/candidates")}>Tillbaka till kandidater</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 border-border/50 shadow-sm h-fit">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{candidate.name}</CardTitle>
              <CardDescription>Kontaktinformation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {candidate.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <Mail className="h-4 w-4" />
                    </div>
                    <a href={`mailto:${candidate.email}`} className="text-sm hover:underline font-medium">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <Phone className="h-4 w-4" />
                    </div>
                    <a href={`tel:${candidate.phone}`} className="text-sm hover:underline font-medium">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md text-primary">
                      <Linkedin className="h-4 w-4" />
                    </div>
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline font-medium truncate"
                    >
                      LinkedIn-profil
                    </a>
                  </div>
                )}
              </div>

              {candidate.cv_url && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Dokument</h4>
                  <Button variant="outline" className="w-full justify-between" asChild>
                    <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Se CV
                      </span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Ansökningar</CardTitle>
              <CardDescription>Jobb där denna kandidat är aktuell</CardDescription>
            </CardHeader>
            <CardContent>
              {appsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Laddar ansökningar...</div>
              ) : candidateApplications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center border-2 border-dashed rounded-lg">
                  Inga kopplade jobb ännu
                </p>
              ) : (
                <div className="space-y-3">
                  {candidateApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">{app.job?.title || "Okänt jobb"}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Status:</span>
                          <Badge 
                            variant={
                              app.status === 'rejected' ? 'destructive' : 
                              app.status === 'offer' ? 'default' : 'secondary'
                            }
                            className="px-2 py-0"
                          >
                            {app.status === 'new' ? 'Ny' : 
                             app.status === 'screening' ? 'Screening' : 
                             app.status === 'interview' ? 'Intervju' : 
                             app.status === 'offer' ? 'Erbjudande' : 'Avslagen'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/jobs/${app.job_id}`)}
                      >
                        Visa jobb
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
