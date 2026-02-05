"use client";

import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { useApplications } from "@/src/hooks/use-applications";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { profile, isLoading: authLoading } = useAuth();
  const { jobs, isLoading: jobsLoading } = useJobs();
  const { applications, isLoading: appsLoading, updateStatus } = useApplications(jobId);
  const { candidates } = useCandidates(profile?.company_id || undefined);
  const { createApplication } = useApplications(jobId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");

  const job = jobs.find((j) => j.id === jobId);

  if (authLoading || jobsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Jobb hittades inte</h2>
          <Button onClick={() => router.push("/")}>Tillbaka till start</Button>
        </div>
      </div>
    );
  }

  const isRecruiter = !!profile;

  const handleAddCandidate = async () => {
    if (!selectedCandidateId) return;

    try {
      createApplication(
        {
          job_id: jobId,
          candidate_id: selectedCandidateId,
          status: "new",
        },
        {
          onSuccess: () => {
            toast.success("Kandidat tillagd!");
            setIsDialogOpen(false);
            setSelectedCandidateId("");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte lägga till kandidat");
          },
        }
      );
    } catch (error: any) {
      toast.error(error.message || "Kunde inte lägga till kandidat");
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    updateStatus(
      { id: applicationId, status: newStatus as any },
      {
        onSuccess: () => {
          toast.success("Status uppdaterad!");
        },
        onError: (error: any) => {
          toast.error(error.message || "Kunde inte uppdatera status");
        },
      }
    );
  };

  const availableCandidates = candidates.filter(
    (candidate) => !applications.some((app) => app.candidate_id === candidate.id)
  );

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

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader className="pt-8 px-8">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  {job.company?.logo_url && (
                    <div className="h-16 w-16 rounded-lg border border-border/50 overflow-hidden bg-background p-1">
                      <img 
                        src={job.company.logo_url} 
                        alt={`${job.company.name} logo`} 
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-3xl font-bold tracking-tight mb-1">{job.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {job.company?.name} • Publicerat {new Date(job.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  {job.location && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                      📍 {job.location}
                    </span>
                  )}
                  {(job.salary_min || job.salary_max) && (
                    <span className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded">
                      💰 {job.salary_min ? `${job.salary_min.toLocaleString()} kr` : ''} 
                      {job.salary_min && job.salary_max ? ' - ' : ''}
                      {job.salary_max ? `${job.salary_max.toLocaleString()} kr` : ''}
                    </span>
                  )}
                </div>
              </div>

              {!isRecruiter && (
                <Button size="lg" asChild className="shrink-0">
                  <Link href={`/jobs/${jobId}/apply`}>
                    Ansök nu
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-8">
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-semibold mb-3">Om tjänsten</h3>
              <p className="text-muted-foreground text-lg whitespace-pre-wrap leading-relaxed">
                {job.description || "Ingen beskrivning tillgänglig för denna tjänst."}
              </p>
            </div>

            {job.company?.description && (
              <div className="border-t pt-8 mt-8">
                <h3 className="text-xl font-semibold mb-3">Om {job.company.name}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {job.company.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isRecruiter && (
          <Card className="border-border/50">
            <CardHeader className="px-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Hantera ansökningar</CardTitle>
                  <CardDescription>Kandidater kopplade till detta jobb</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Lägg till kandidat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lägg till kandidat</DialogTitle>
                      <DialogDescription>
                        Välj en kandidat att lägga till i detta jobb
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Välj kandidat" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCandidates.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Inga tillgängliga kandidater
                            </SelectItem>
                          ) : (
                            availableCandidates.map((candidate) => (
                              <SelectItem key={candidate.id} value={candidate.id}>
                                {candidate.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddCandidate}
                        disabled={!selectedCandidateId}
                        className="w-full"
                      >
                        Lägg till
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {appsLoading ? (
                <div>Laddar...</div>
              ) : applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Inga kandidater ännu</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Namn</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">
                          {app.candidate?.name || "Okänd"}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={app.status}
                            onValueChange={(value) => handleStatusChange(app.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Ny</SelectItem>
                              <SelectItem value="screening">Screening</SelectItem>
                              <SelectItem value="interview">Intervju</SelectItem>
                              <SelectItem value="offer">Erbjudande</SelectItem>
                              <SelectItem value="rejected">Avslagen</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/candidates/${app.candidate_id}`)}
                          >
                            Visa profil
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}