"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Loader2, AlertCircle } from "lucide-react";
import type { Invite, Company } from "@/src/lib/types/database";

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const supabase = createClient();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvite() {
      try {
        const { data: inviteData, error: inviteError } = await supabase
          .from("invites")
          .select("*, company:companies(*)")
          .eq("token", token)
          .single();

        if (inviteError || !inviteData) {
          setError("Inbjudan är ogiltig eller har gått ut.");
          return;
        }

        if (inviteData.accepted_at) {
          setError("Denna inbjudan har redan använts.");
          return;
        }

        if (new Date(inviteData.expires_at) < new Date()) {
          setError("Inbjudan har gått ut.");
          return;
        }

        setInvite(inviteData);
        setCompany(inviteData.company);
      } catch (err) {
        setError("Ett fel uppstod vid hämtning av inbjudan.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvite();
  }, [token, supabase]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite || !company) return;
    setIsSubmitting(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Kunde inte skapa konto.");

      // 2. Create Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          company_id: company.id,
          role: invite.role,
          name: name
        });

      if (profileError) throw profileError;

      // 3. Mark invite as accepted
      const { error: updateError } = await supabase
        .from("invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invite.id);

      if (updateError) throw updateError;

      toast.success("Välkommen till teamet! Du kan nu logga in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Invite acceptance error:", error);
      toast.error(error.message || "Ett fel uppstod.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-6 flex justify-center pt-20">
          <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="h-5 w-5" />
                <CardTitle>Ogiltig inbjudan</CardTitle>
              </div>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => router.push("/")} className="w-full">
                Tillbaka till start
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Gå med i {company?.name}</CardTitle>
            <CardDescription>
              Fyll i dina uppgifter för att slutföra din registrering.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-2">
                <Label>E-post</Label>
                <Input value={invite?.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Ditt namn</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Förnamn Efternamn"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Välj lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minst 6 tecken"
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Går med...
                  </>
                ) : (
                  "Gå med i teamet"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
