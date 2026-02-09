"use client";

import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Search, Trash2, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingState } from "@/components/layout/loading-state";
import { EmptyState } from "@/components/layout/empty-state";

export default function CandidatesPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

  const { candidates, isLoading: candidatesLoading, deleteCandidate } = useCandidates(effectiveCompanyId || undefined);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [candidates, searchQuery]);

  const handleDeleteCandidate = (id: string, name: string) => {
    if (confirm(`Är du helt säker på att du vill ta bort ${name}? Detta kommer radera all historik, ansökningar och intervjuer permanent.`)) {
      deleteCandidate(id, {
        onSuccess: () => toast.success("Kandidat borttagen"),
        onError: (err: any) => toast.error(err.message || "Kunde inte ta bort kandidat")
      });
    }
  };

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Alla kandidater</CardTitle>
                <CardDescription>Hantera dina kandidater och deras ansökningar</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Sök kandidater..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
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
            ) : filteredCandidates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Inga kandidater matchade din sökning.</p>
                <Button variant="link" onClick={() => setSearchQuery("")}>Rensa sökning</Button>
              </div>
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
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.email || "-"}</TableCell>
                      <TableCell>{candidate.phone || "-"}</TableCell>
                      <TableCell>
                        {candidate.linkedin_url ? (
                          <a
                            href={candidate.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            LinkedIn
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/candidates/${candidate.id}`)}
                            className="group-hover:translate-x-1 transition-transform"
                          >
                            Visa
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          {candidate.cv_url && (
                            <Button variant="ghost" size="icon" asChild title="Se CV">
                              <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 text-primary" />
                              </a>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
      </div>
    </div>
  );
}