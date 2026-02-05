"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import { useAdmin } from "@/src/providers/admin-provider";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/layout/loading-state";
import { StatCard } from "@/components/layout/stat-card";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;
  
  const { jobs, isLoading: jobsLoading } = useJobs(effectiveCompanyId || undefined);
  const { candidates, isLoading: candidatesLoading } = useCandidates(effectiveCompanyId || undefined);

  if (!mounted || authLoading || !profile) {
    return (
      <LoadingState fullPage message="Laddar dashboard..." />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Välkommen tillbaka, ${profile.name}!`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Jobb"
          value={jobsLoading ? "..." : jobs.length}
          description="Aktiva jobbannonser"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="Kandidater"
          value={candidatesLoading ? "..." : candidates.length}
          description="Totalt antal kandidater"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Snabbåtgärder</CardTitle>
            <CardDescription>Vanliga åtgärder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-between bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
              variant="outline"
              onClick={() => router.push("/recruitment/new")}
            >
              Starta rekryteringsprocess
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-between"
              variant="outline"
              onClick={() => router.push("/jobs/new")}
            >
              Skapa nytt jobb
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-between"
              variant="outline"
              onClick={() => router.push("/candidates/new")}
            >
              Lägg till kandidat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              className="w-full justify-between"
              variant="outline"
              onClick={() => router.push("/kanban")}
            >
              Öppna Kanban
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senaste jobb</CardTitle>
            <CardDescription>Dina senaste jobbannonser</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <LoadingState message="Laddar jobb..." />
            ) : jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Inga jobb ännu</p>
            ) : (
              <div className="space-y-2">
                {jobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => router.push(`/jobs/${job.id}`)}
                  >
                    <span className="text-sm font-medium">{job.title}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
