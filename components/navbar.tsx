"use client";

import Link from "next/link";
import { useAuth } from "@/src/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Briefcase } from "lucide-react";
import { useAdmin } from "@/src/providers/admin-provider";
import { useCompanies } from "@/src/hooks/use-companies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { profile, signOut } = useAuth();
  const { selectedCompanyId, setSelectedCompanyId } = useAdmin();
  const { companies } = useCompanies();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Mini-ATS</span>
          </Link>
          {mounted && profile && (
            <div className="hidden md:flex gap-4">
              <Link
                href={profile.role === "admin" ? "/admin" : "/dashboard"}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/jobs"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Rekrytering
              </Link>
              <Link
                href="/candidates"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Kandidater
              </Link>
              <Link
                href="/kanban"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Kanban
              </Link>
              <Link
                href="/settings"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Inställningar
              </Link>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {mounted && profile?.role === "admin" && (
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Vy:</span>
              <Select
                value={selectedCompanyId || "all"}
                onValueChange={(val) => setSelectedCompanyId(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-[200px] h-8 text-xs">
                  <SelectValue placeholder="Alla företag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla företag</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <ThemeToggle />
          {mounted ? (
            profile ? (
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Logga ut
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Logga in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Kom igång</Link>
                </Button>
              </div>
            )
          ) : (
            <div className="w-20 h-8" />
          )}
        </div>
      </div>
    </nav>
  );
}
