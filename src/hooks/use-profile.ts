"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/src/lib/types/database";

export function useProfile() {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const res = await fetch(`/api/profiles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update profile");
      }
      return res.json() as Promise<Profile>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "profile", data.id] });
    },
  });

  return {
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.status === "pending",
  };
}