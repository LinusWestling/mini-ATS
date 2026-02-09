"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Job, Company } from "@/src/lib/types/database";

export function useJobs(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", companyId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (companyId) params.append("companyId", companyId);
      
      const res = await fetch(`/api/jobs?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch jobs");
      }
      return res.json() as Promise<(Job & { company: Company })[]>;
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (job: Omit<Job, "id" | "created_at">) => {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create job");
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update job");
      }
      return res.json() as Promise<Job>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete job");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return {
    jobs: jobs || [],
    isLoading,
    createJob: createJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    deleteJob: deleteJobMutation.mutate,
  };
}