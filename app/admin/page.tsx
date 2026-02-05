"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useCompanies } from "@/src/hooks/use-companies";
import { useAdminActions } from "@/src/hooks/use-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/layout/loading-state";

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const { profile, isLoading: authLoading } = useAuth();
  const { companies, isLoading: companiesLoading } = useCompanies();
  const { createCustomer, isCreating } = useAdminActions();
  const { setSelectedCompanyId } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [customerName, setCustomerName] = useState("");

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <LoadingState fullPage message="Laddar admin..." />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="p-10 text-center">Åtkomst nekad</div>
      </div>
    );
  }

  const handleViewDashboard = (companyId: string) => {
    setSelectedCompanyId(companyId);
    router.push("/dashboard");
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCustomer({
        companyName,
        customerEmail,
        customerPassword,
        customerName,
        adminId: profile.id,
      });

      toast.success("Kundkonto skapat!");
      setIsDialogOpen(false);
      setCompanyName("");
      setCustomerEmail("");
      setCustomerPassword("");
      setCustomerName("");
    } catch (error: any) {
      toast.error(error.message || "Kunde inte skapa kundkonto");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight">Admin Panel</h1>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Kunder</CardTitle>
                <CardDescription>Hantera kundkonton och företag</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Skapa kundkonto
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Skapa nytt kundkonto</DialogTitle>
                    <DialogDescription>
                      Skapa ett nytt kundkonto med tillhörande företag
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCustomer} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Företagsnamn</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Kundens namn</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">E-post</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPassword">Lösenord</Label>
                      <Input
                        id="customerPassword"
                        type="password"
                        value={customerPassword}
                        onChange={(e) => setCustomerPassword(e.target.value)}
                        required
                        disabled={isCreating}
                        minLength={6}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                      {isCreating ? "Skapar..." : "Skapa konto"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <LoadingState message="Laddar företag..." />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Företagsnamn</TableHead>
                    <TableHead>Skapad</TableHead>
                    <TableHead className="text-right">Åtgärder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Inga företag ännu
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>
                          {new Date(company.created_at).toLocaleDateString("sv-SE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDashboard(company.id)}
                          >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Visa Dashboard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}