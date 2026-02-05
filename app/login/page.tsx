"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/src/hooks/use-auth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const supabase = createClient();

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      console.log("Profile detected, redirecting...", profile.role);
      const target = profile.role === "admin" ? "/admin" : "/dashboard";
      router.replace(target);
    }
  }, [profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("Auth success, user ID:", data.user.id);

      // Invalidate auth queries to ensure useAuth() updates
      await queryClient.invalidateQueries({ queryKey: ["auth"] });

      // Get profile directly for immediate redirect
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Even if profile fetch fails, we are logged in.
        // The useEffect will handle it once useAuth refetches.
        router.refresh();
        return;
      }

      console.log("Profile fetched, redirecting to:", profileData?.role === "admin" ? "/admin" : "/dashboard");
      
      const target = profileData?.role === "admin" ? "/admin" : "/dashboard";
      
      // Use router.replace to avoid back-button loops
      router.replace(target);
      router.refresh();
      toast.success("Inloggning lyckades!");
    } catch (error: any) {
      console.error("Login catch block:", error);
      toast.error(error.message || "Inloggning misslyckades");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loggar in..." : "Logga in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
