"use client";

import { useState } from "react";
import { useTeam } from "@/src/hooks/use-team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, UserPlus, Users, Mail, Trash2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";

interface TeamManagementProps {
  companyId: string;
}

export function TeamManagement({ companyId }: TeamManagementProps) {
  const [mounted, setMounted] = useState(false);
  const { members, invites, isLoading, createInvite, deleteInvite } = useTeam(companyId);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);

    createInvite(
      { email, role: "customer" },
      {
        onSuccess: () => {
          toast.success(`Inbjudan skickad till ${email}`);
          setEmail("");
        },
        onError: (error: any) => {
          toast.error(error.message || "Kunde inte skicka inbjudan.");
        },
        onSettled: () => {
          setIsInviting(false);
        }
      }
    );
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      deleteInvite(id, {
        onSuccess: () => {
          toast.success("Inbjudan borttagen.");
        },
      });
    } catch (error) {
      toast.error("Kunde inte ta bort inbjudan.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teammedlemmar
              </CardTitle>
              <CardDescription>
                Dina kollegor som har tillgång till detta företagskonto.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="h-fit">
              {members.length} {members.length === 1 ? 'medlem' : 'medlemmar'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                    {member.role === "admin" && (
                      <Badge variant="outline" className="border-primary/50 text-primary">
                        System Admin
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="h-5 w-5" />
              Bjud in kollega
            </CardTitle>
            <CardDescription>
              Skicka en inbjudan till en kollega för att samarbeta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">E-postadress</Label>
                <div className="flex gap-2">
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namn@foretag.se"
                    required
                  />
                  <Button type="submit" disabled={isInviting || !email}>
                    {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Bjud in"}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Mottagaren kommer att få en länk för att registrera sitt konto kopplat till ditt företag.
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Väntande inbjudningar
            </CardTitle>
            <CardDescription>
              Personer som ännu inte har accepterat sin inbjudan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <div className="text-center py-6 border-2 border-dashed rounded-xl">
                <Mail className="mx-auto h-8 w-8 text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">Inga väntande inbjudningar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{invite.email}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Går ut: {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
