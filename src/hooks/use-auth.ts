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
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
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
    signOut: signOutMutation.mutate,
  };
}
