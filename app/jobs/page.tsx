"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { useRecruitmentProcesses } from "@/src/hooks/use-recruitment-processes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Briefcase, Sparkles, Clock, CheckCircle2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/layout/loading-state";
import { EmptyState } from "@/components/layout/empty-state";

export default function JobsPage() {
  const [mounted, setMounted] = useState(false);
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "processes">("jobs");

  useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

  const { jobs, isLoading: jobsLoading, deleteJob } = useJobs(effectiveCompanyId || undefined);
  const { processes, isLoading: processesLoading, deleteProcess } = useRecruitmentProcesses(effectiveCompanyId || undefined);

  const handleDeleteJob = async (id: string) => {
    if (confirm("Är du säker på att du vill ta bort detta jobb?")) {
      deleteJob(id, {
        onSuccess: () => toast.success("Jobb borttaget"),
        onError: () => toast.error("Kunde inte ta bort jobb"),
      });
    }
  };

  const handleDeleteProcess = async (id: string) => {
    if (confirm("Är du säker på att du vill ta bort denna process?")) {
      deleteProcess(id, {
        onSuccess: () => toast.success("Process borttagen"),
        onError: () => toast.error("Kunde inte ta bort process"),
      });
    }
  };

  if (authLoading || !mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingState fullPage message="Laddar rekrytering..." />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Rekrytering">
          <Button variant="outline" onClick={() => router.push("/recruitment/new")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Starta process
          </Button>
          <Button onClick={() => router.push("/jobs/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Skapa nytt jobb
          </Button>
        </PageHeader>

        <div className="flex border-b border-border mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "jobs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("jobs")}
          >
            Jobbannonser
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "processes"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("processes")}
          >
            Rekryteringsprocesser
          </button>
        </div>

        {activeTab === "jobs" ? (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Alla jobb
              </CardTitle>
              <CardDescription>Hantera dina aktiva jobbannonser</CardDescription>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <LoadingState message="Laddar jobb..." />
              ) : jobs.length === 0 ? (
                <EmptyState
                  title="Inga jobb ännu"
                  description="Skapa ditt första jobb för att börja ta emot ansökningar."
                  action={{
                    label: "Skapa ditt första jobb",
                    onClick: () => router.push("/jobs/new"),
                    icon: <Plus className="h-4 w-4" />
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Beskrivning</TableHead>
                      <TableHead>Skapad</TableHead>
                      <TableHead className="text-right">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell className="max-w-md truncate">
                          {job.description || "-"}
                        </TableCell>
                        <TableCell>
                          {new Date(job.created_at).toLocaleDateString("sv-SE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                              Visa
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Aktiva processer
              </CardTitle>
              <CardDescription>Planering och förberedelser för nya roller</CardDescription>
            </CardHeader>
            <CardContent>
              {processesLoading ? (
                <LoadingState message="Laddar processer..." />
              ) : processes.length === 0 ? (
                <EmptyState
                  title="Inga rekryteringsprocesser ännu"
                  description="Starta en ny process för att planera din nästa rekrytering."
                  action={{
                    label: "Starta din första process",
                    onClick: () => router.push("/recruitment/new"),
                    icon: <Plus className="h-4 w-4" />
                  }}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll</TableHead>
                      <TableHead>Avdelning</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Skapad</TableHead>
                      <TableHead className="text-right">Åtgärder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((process) => (
                      <TableRow key={process.id}>
                        <TableCell className="font-medium">{process.role_name}</TableCell>
                        <TableCell>{process.department?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={process.status === 'completed' ? 'secondary' : 'default'} className="flex w-fit items-center gap-1">
                            {process.status === 'draft' && <Clock className="h-3 w-3" />}
                            {process.status === 'active' && <Sparkles className="h-3 w-3" />}
                            {process.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                            <span className="capitalize">{process.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(process.created_at).toLocaleDateString("sv-SE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/recruitment/${process.id}`)}
                            >
                              Hantera
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteProcess(process.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
