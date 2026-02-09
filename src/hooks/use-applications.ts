"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Application, ApplicationStatus } from "@/src/lib/types/database";

export function useApplications(jobId?: string, companyId?: string) {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", jobId, companyId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (jobId) params.append("jobId", jobId);
      if (companyId) params.append("companyId", companyId);

      const res = await fetch(`/api/applications?${params}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch applications");
      }
      return res.json() as Promise<Application[]>;
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (application: Omit<Application, "id" | "created_at" | "job" | "candidate">) => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create application");
      }
      return res.json() as Promise<Application>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update application status");
      }
      return res.json() as Promise<Application>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete application");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  return {
    applications: applications || [],
    isLoading,
    createApplication: createApplicationMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deleteApplication: deleteApplicationMutation.mutate,
  };
}