"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/hooks/use-auth";
import { useCandidates } from "@/src/hooks/use-candidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useAdmin } from "@/src/providers/admin-provider";

export default function NewCandidatePage() {
  const router = useRouter();
  const { profile, isLoading: authLoading } = useAuth();
  const { selectedCompanyId } = useAdmin();
  const { createCandidate } = useCandidates();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveCompanyId = profile?.role === "admin" ? selectedCompanyId : profile?.company_id;

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

  if (!profile || !effectiveCompanyId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Inget företag valt</h2>
          <p className="text-muted-foreground mb-6">
            Du måste välja ett företag i menyn ovan innan du kan lägga till en kandidat.
          </p>
          <Button onClick={() => router.push("/admin")}>Gå till Admin</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      createCandidate(
        {
          company_id: effectiveCompanyId,
          name,
          email: email || null,
          phone: phone || null,
          linkedin_url: linkedinUrl || null,
        },
        {
          onSuccess: () => {
            toast.success("Kandidat tillagd!");
            router.push("/candidates");
          },
          onError: (error: any) => {
            toast.error(error.message || "Kunde inte lägga till kandidat");
          },
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tillbaka
        </Button>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold tracking-tight">Lägg till kandidat</CardTitle>
            <CardDescription>
              Lägg till en ny kandidat i systemet {profile.role === "admin" ? "(som Admin)" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Namn *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="T.ex. Anna Andersson"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="anna.andersson@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    placeholder="+46 70 123 45 67"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://www.linkedin.com/in/anna-andersson"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Lägger till..." : "Lägg till kandidat"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Avbryt
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}