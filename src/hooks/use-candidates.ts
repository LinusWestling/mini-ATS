"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { Candidate } from "@/src/lib/types/database";

export function useCandidates(companyId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["candidates", companyId],
    queryFn: async () => {
      let query = supabase.from("candidates").select("*").order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Candidate[];
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (candidate: Omit<Candidate, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("candidates")
        .insert(candidate)
        .select()
        .single();
      
      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Candidate> & { id: string }) => {
      const { data, error } = await supabase
        .from("candidates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Candidate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
    },
  });

  const deleteCandidateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("candidates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
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
