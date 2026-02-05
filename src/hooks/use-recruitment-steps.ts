"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { RecruitmentStep } from "@/src/lib/types/database";

export function useRecruitmentSteps(companyId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: steps, isLoading } = useQuery({
    queryKey: ["recruitment-steps", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("recruitment_steps")
        .select("*")
        .eq("company_id", companyId)
        .order("order", { ascending: true });
      
      if (error) throw error;
      return data as RecruitmentStep[];
    },
    enabled: !!companyId,
  });

  const updateStepsOrderMutation = useMutation({
    mutationFn: async (newSteps: RecruitmentStep[]) => {
      const updates = newSteps.map((step, index) => ({
        id: step.id,
        order: index,
        company_id: step.company_id, // required for RLS policies sometimes
      }));

      const { error } = await supabase
        .from("recruitment_steps")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-steps"] });
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async (step: Omit<RecruitmentStep, "id" | "created_at" | "is_system">) => {
      const { data, error } = await supabase
        .from("recruitment_steps")
        .insert(step)
        .select()
        .single();
      
      if (error) throw error;
      return data as RecruitmentStep;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-steps"] });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recruitment_steps")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-steps"] });
    },
  });

  return {
    steps: steps || [],
    isLoading,
    updateStepsOrder: updateStepsOrderMutation.mutate,
    createStep: createStepMutation.mutate,
    deleteStep: deleteStepMutation.mutate,
  };
}
