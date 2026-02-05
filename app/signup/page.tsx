"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (authError) {
        if (authError.message.includes("rate limit")) {
          throw new Error("För många försök. Vänta en stund eller ändra inställningarna i Supabase Dashboard (Authentication > Settings > Rate Limits).");
        }
        throw authError;
      }
      if (!authData.user) throw new Error("Kunde inte skapa konto.");

      // 2. Create Company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: companyName,
          created_by: authData.user.id
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // 3. Create Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          company_id: company.id,
          role: "customer",
          name: name
        });

      if (profileError) throw profileError;

      toast.success("Konto skapat! Du kan nu logga in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Ett fel uppstod vid registrering.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-4 pt-20">
        <Card className="w-full max-w-md border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Skapa konto</CardTitle>
            <CardDescription>
              Registrera ditt företag för att börja rekrytera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Företagsnamn</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Ex. Acme Corp"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Ditt namn</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Förnamn Efternamn"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-post</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="namn@företag.se"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lösenord</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Minst 6 tecken"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Skapar konto...
                  </>
                ) : (
                  "Skapa konto"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              Har du redan ett konto?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Logga in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
