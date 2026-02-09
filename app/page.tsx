"use client";

import { useJobs } from "@/src/hooks/use-jobs";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, ArrowRight, MapPin, Calendar } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { jobs, isLoading } = useJobs();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 text-center bg-linear-to-b from-primary/5 to-transparent">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
              Hitta din nästa <span className="text-primary">utmaning</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Utforska spännande karriärmöjligheter hos våra anslutna företag. 
              Enkel ansökan och direktkontakt med rekryterare.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="#jobs">Se alla lediga jobb</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link href="/login">För företag</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section id="jobs" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Lediga tjänster</h2>
                <p className="text-muted-foreground">Hitta ditt drömjobb bland våra {jobs.length} aktiva annonser</p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                    <CardContent className="h-20 bg-muted/50 mt-4" />
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Inga lediga jobb just nu</h3>
                <p className="text-muted-foreground mt-2">Kolla gärna tillbaka senare!</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                  <Card key={job.id} className="group hover:shadow-lg transition-all border-border/50">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          <Link href={`/jobs/${job.id}`} className="hover:underline underline-offset-4 decoration-primary/30">
                            {job.title}
                          </Link>
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Briefcase className="h-4 w-4" />
                        Aktiv annons
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3 mb-6">
                        {job.description || "Ingen beskrivning tillgänglig."}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Sverige
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {mounted ? new Date(job.created_at).toLocaleDateString() : "..."}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" asChild>
                          <Link href={`/jobs/${job.id}`}>
                            Ansök
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-bold">Mini-ATS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Mini-ATS. Alla rättigheter förbehållna.
          </p>
        </div>
      </footer>
    </div>
  );
}