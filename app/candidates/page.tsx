"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/layout/loading-state";
import { EmptyState } from "@/components/layout/empty-state";

export default function CandidatesPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

  const { candidates, isLoading: candidatesLoading } = useCandidates(effectiveCompanyId || undefined);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingState fullPage message="Laddar kandidater..." />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Kandidater">
          <Button onClick={() => router.push("/candidates/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Lägg till kandidat
          </Button>
        </PageHeader>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Alla kandidater</CardTitle>
            <CardDescription>Hantera dina kandidater och deras ansökningar</CardDescription>
          </CardHeader>
          <CardContent>
            {candidatesLoading ? (
              <LoadingState message="Laddar kandidatlista..." />
            ) : candidates.length === 0 ? (
              <EmptyState
                title="Inga kandidater ännu"
                description="Lägg till din första kandidat manuellt eller via ansökningsformuläret."
                action={{
                  label: "Lägg till din första kandidat",
                  onClick: () => router.push("/candidates/new"),
                  icon: <Plus className="h-4 w-4" />
                }}
              />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>LinkedIn</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.email || "-"}</TableCell>
                    <TableCell>{candidate.phone || "-"}</TableCell>
                    <TableCell>
                      {candidate.linkedin_url ? (
                        <a
                          href={candidate.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/candidates/${candidate.id}`)}
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
