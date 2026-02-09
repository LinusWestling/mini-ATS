"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Candidate } from "@/src/lib/types/database";

export function useCandidates(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates", companyId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (companyId) params.append("companyId", companyId);
      
      const res = await fetch(`/api/candidates?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch candidates");
      }
      return res.json() as Promise<Candidate[]>;
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (candidate: Omit<Candidate, "id" | "created_at">) => {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidate),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create candidate");
      }
      return res.json() as Promise<Candidate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Candidate> & { id: string }) => {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update candidate");
      }
      return res.json() as Promise<Candidate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/candidates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete candidate");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  return {
    candidates: candidates || [],
    isLoading,
    createCandidate: createCandidateMutation.mutate,
    updateCandidate: updateCandidateMutation.mutate,
    deleteCandidate: deleteCandidateMutation.mutate,
  };
}