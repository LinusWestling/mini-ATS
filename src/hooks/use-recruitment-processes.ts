"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RecruitmentProcess, Department } from "@/src/lib/types/database";

export function useRecruitmentProcesses(companyId?: string) {
  const queryClient = useQueryClient();

  // Fetch processes
  const { data: processes, isLoading: processesLoading } = useQuery({
    queryKey: ["recruitment-processes", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await fetch(`/api/recruitment-processes?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch recruitment processes");
      }
      return res.json() as Promise<RecruitmentProcess[]>;
    },
    enabled: !!companyId,
  });

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await fetch(`/api/departments?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch departments");
      }
      return res.json() as Promise<Department[]>;
    },
    enabled: !!companyId,
  });

  // Create process mutation
  const createProcessMutation = useMutation({
    mutationFn: async (process: Omit<RecruitmentProcess, "id" | "created_at">) => {
      const res = await fetch("/api/recruitment-processes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(process),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create recruitment process");
      }
      return res.json() as Promise<RecruitmentProcess>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-processes", companyId] });
    },
  });

  // Update process mutation
  const updateProcessMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecruitmentProcess> & { id: string }) => {
      const res = await fetch(`/api/recruitment-processes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update recruitment process");
      }
      return res.json() as Promise<RecruitmentProcess>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-processes", companyId] });
    },
  });

  // Create department mutation
  const createDepartmentMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!companyId) throw new Error("Company ID is required");
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, company_id: companyId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create department");
      }
      return res.json() as Promise<Department>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments", companyId] });
    },
  });

  // Delete process mutation
  const deleteProcessMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/recruitment-processes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete recruitment process");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment-processes", companyId] });
    },
  });

  return {
    processes: processes || [],
    departments: departments || [],
    isLoading: processesLoading || departmentsLoading,
    createProcess: createProcessMutation.mutate,
    updateProcess: updateProcessMutation.mutate,
    deleteProcess: deleteProcessMutation.mutate,
    createDepartment: createDepartmentMutation.mutate,
  };
}