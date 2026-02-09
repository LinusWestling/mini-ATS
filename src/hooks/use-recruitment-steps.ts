"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecruitmentStep } from "@/src/lib/types/database";

export function useRecruitmentSteps(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: steps, isLoading } = useQuery({
    queryKey: ["recruitment-steps", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const res = await fetch(`/api/recruitment-steps?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch recruitment steps");
      }
      return res.json() as Promise<RecruitmentStep[]>;
    },
    enabled: !!companyId,
  });

  const updateStepsOrderMutation = useMutation({
    mutationFn: async (newSteps: RecruitmentStep[]) => {
      const updates = newSteps.map((step, index) => ({
        ...step,
        order: index,
      }));

      const res = await fetch("/api/recruitment-steps/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update steps order");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-steps"] });
    },
  });

  const createStepMutation = useMutation({
    mutationFn: async (step: Omit<RecruitmentStep, "id" | "created_at" | "is_system">) => {
      const res = await fetch("/api/recruitment-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(step),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create recruitment step");
      }
      return res.json() as Promise<RecruitmentStep>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-steps"] });
    },
  });

  const deleteStepMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recruitment-steps/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete recruitment step");
      }
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