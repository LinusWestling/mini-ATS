"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { useApplications } from "@/src/hooks/use-applications";
import { useCandidateInterviews } from "@/src/hooks/use-interviews";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Linkedin, FileText, ExternalLink, ArrowRight, MessageSquare, Calendar as CalendarIcon, Star, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useState } from "react";
import { InterviewModal } from "@/components/interview-modal";
import { toast } from "sonner";

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const { profile, isLoading: authLoading } = useAuth();
  const { candidates, deleteCandidate } = useCandidates(profile?.company_id || undefined);
  const { applications, isLoading: appsLoading } = useApplications(undefined, profile?.company_id || undefined);
  const { interviews, isLoading: interviewsLoading, deleteInterview } = useCandidateInterviews(candidateId);

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const candidate = candidates.find((c) => c.id === candidateId);
  const candidateApplications = applications.filter((app) => app.candidate_id === candidateId);

  const handleDeleteInterview = (id: string) => {
    if (confirm("Är du säker på att du vill ta bort denna intervju?")) {
      deleteInterview(id, {
        onSuccess: () => toast.success("Intervju borttagen"),
        onError: (err: any) => toast.error(err.message || "Kunde inte ta bort intervju")
      });
    }
  };

  const handleDeleteCandidate = () => {
    if (!candidate) return;
    if (confirm(`Är du helt säker på att du vill ta bort ${candidate.name}? Detta kommer radera all historik, ansökningar och intervjuer permanent.`)) {
      deleteCandidate(candidate.id, {
        onSuccess: () => {
          toast.success("Kandidat borttagen");
          router.push("/candidates");
        },
        onError: (err: any) => toast.error(err.message || "Kunde inte ta bort kandidat")
      });
    }
  };

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

  const calculateMeanScore = (feedback: any[]) => {
    if (!feedback || feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.score, 0);
    return (sum / feedback.length).toFixed(1);
  };

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

              {candidate.extra_fields && candidate.extra_fields.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-semibold mb-2 uppercase tracking-wider text-muted-foreground">Extra information</h4>
                  {candidate.extra_fields.map((field: any, i: number) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground/70">{field.label}</span>
                      <span className="text-sm font-medium">{field.value}</span>
                    </div>
                  ))}
                </div>
              )}

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

              <div className="pt-4 border-t space-y-2">
                <h4 className="text-sm font-semibold mb-3">Åtgärder</h4>
                <Button className="w-full" onClick={() => setIsInterviewModalOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Starta intervju
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:bg-destructive hover:text-destructive-foreground" 
                  onClick={handleDeleteCandidate}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Ta bort kandidat
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Intervjuhistorik</CardTitle>
                <CardDescription>Tidigare genomförda intervjuer och bedömningar</CardDescription>
              </CardHeader>
              <CardContent>
                {interviewsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Laddar intervjuer...</div>
                ) : interviews.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>Inga intervjuer genomförda ännu</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interviews.map((interview: any) => {
                      const score = calculateMeanScore(interview.feedback);
                      return (
                        <div key={interview.id} className="p-4 rounded-xl border border-border/50 bg-background hover:bg-muted/10 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-lg">{interview.title}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <BriefcaseIcon className="h-3 w-3" />
                                {interview.process?.role_name || "Okänd roll"} • {new Date(interview.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                                  <Star className="h-3 w-3 fill-primary" />
                                  {score}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">Medelbetyg</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteInterview(interview.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {interview.notes && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 italic">
                              "{interview.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
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
        
        {candidate && profile && (
          <InterviewModal 
            isOpen={isInterviewModalOpen}
            onOpenChange={setIsInterviewModalOpen}
            candidateId={candidate.id}
            candidateName={candidate.name}
            companyId={profile.company_id}
          />
        )}
      </div>
    </div>
  );
}

// Helper to avoid import error
function BriefcaseIcon({ className }: { className?: string }) {
  return <FileText className={className} />;
}