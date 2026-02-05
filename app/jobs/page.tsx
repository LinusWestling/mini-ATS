"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useJobs } from "@/src/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";

export default function JobsPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

  const { jobs, isLoading: jobsLoading } = useJobs(effectiveCompanyId || undefined);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Jobb</h1>
          <Button onClick={() => router.push("/jobs/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Skapa nytt jobb
          </Button>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Alla jobb</CardTitle>
            <CardDescription>Hantera dina jobbannonser</CardDescription>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Laddar jobb...</div>
            ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Inga jobb ännu</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/jobs/new")}
              >
                Skapa ditt första jobb
              </Button>
            </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        Visa
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
              </Card>
            </div>
          </div>
        );
      }
