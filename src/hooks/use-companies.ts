"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { Company } from "@/src/lib/types/database";

export function useCompanies() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Company[];
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (company: Omit<Company, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("companies")
        .insert(company)
        .select()
        .single();
      
      if (error) throw error;
      return data as Company;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Company> & { id: string }) => {
      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Company;
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
