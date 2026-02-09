"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company } from "@/src/lib/types/database";

export function useCompanies() {
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch companies");
      }
      return res.json() as Promise<Company[]>;
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at">) => {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create company");
      }
      return res.json() as Promise<Company>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update company");
      }
      return res.json() as Promise<Company>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  return {
    companies: companies || [],
    isLoading,
    createCompany: createCompanyMutation.mutate,
    updateCompany: updateCompanyMutation.mutate,
  };
}