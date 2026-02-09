"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/src/lib/types/database";

export function useAuth() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["auth", "profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        // If 401, it means we might have a user session in client but cookies are out of sync or invalid
        if (res.status === 401) return null;
        throw new Error("Failed to fetch profile");
      }
      return res.json() as Promise<Profile>;
    },
    enabled: !!user,
  });

  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string, password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] }); // Refresh data that might depend on auth
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    profile,
    isLoading: userLoading || (!!user && profileLoading),
    isAdmin: profile?.role === "admin",
    isCustomer: profile?.role === "customer",
    signIn: signInMutation.mutateAsync,
    isLoggingIn: signInMutation.isPending,
    signOut: signOutMutation.mutate,
  };
}