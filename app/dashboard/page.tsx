"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import { useAdmin } from "@/src/providers/admin-provider";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();
  
  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;
  
  const { jobs, isLoading: jobsLoading } = useJobs(effectiveCompanyId || undefined);
  const { candidates, isLoading: candidatesLoading } = useCandidates(effectiveCompanyId || undefined);

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Välkommen tillbaka, {profile.name}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobb</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsLoading ? "..." : jobs.length}</div>
            <p className="text-xs text-muted-foreground">Aktiva jobbannonser</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kandidater</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{candidatesLoading ? "..." : candidates.length}</div>
            <p className="text-xs text-muted-foreground">Totalt antal kandidater</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Snabbåtgärder</CardTitle>
            <CardDescription>Vanliga åtgärder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
              <div>Laddar...</div>
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
