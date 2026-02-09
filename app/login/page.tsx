"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/use-auth";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { profile, signIn, isLoggingIn } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      const target = profile.role === "admin" ? "/admin" : "/dashboard";
      router.replace(target);
    }
  }, [profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signIn({ email, password });
      toast.success("Inloggning lyckades!");
      // The useEffect will handle redirection once profile is loaded
    } catch (error: any) {
      toast.error(error.message || "Inloggning misslyckades");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 gap-8">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <Briefcase className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold tracking-tight">Mini-ATS</span>
      </Link>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Logga in</CardTitle>
          <CardDescription>
            Ange dina inloggningsuppgifter för att fortsätta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="namn@exempel.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
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
                disabled={isLoggingIn}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Loggar in..." : "Logga in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
