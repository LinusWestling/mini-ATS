"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/hooks/use-auth";
import { useProfile } from "@/src/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Bell, Mail, UserPlus, RefreshCw } from "lucide-react";

export function NotificationSettings() {
  const { profile } = useAuth();
  const { updateProfile, isUpdating } = useProfile();
  
  const [prefs, setPrefs] = useState({
    new_candidate: true,
    status_change: true,
    email_notifications: true
  });

  useEffect(() => {
    if (profile?.notification_preferences) {
      setPrefs(profile.notification_preferences as any);
    }
  }, [profile]);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!profile) return;
    
    updateProfile(
      { 
        id: profile.id, 
        notification_preferences: prefs 
      },
      {
        onSuccess: () => {
          toast.success("Notisinställningar sparade!");
        },
        onError: () => {
          toast.error("Kunde inte spara inställningar.");
        }
      }
    );
  };

  if (!profile) return null;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notisinställningar
        </CardTitle>
        <CardDescription>
          Välj hur och när du vill bli påmind om händelser i systemet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Ny kandidat</p>
                <p className="text-xs text-muted-foreground">Få en notis när någon söker ett jobb.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.new_candidate}
              onChange={() => handleToggle('new_candidate')}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Statusändring</p>
                <p className="text-xs text-muted-foreground">Få en notis när en kandidat flyttas i Kanban.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.status_change}
              onChange={() => handleToggle('status_change')}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">E-postnotiser</p>
                <p className="text-xs text-muted-foreground">Skicka sammanfattningar via e-post.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefs.email_notifications}
              onChange={() => handleToggle('email_notifications')}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isUpdating} className="w-full sm:w-auto">
          {isUpdating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
          Spara inställningar
        </Button>
      </CardContent>
    </Card>
  );
}
