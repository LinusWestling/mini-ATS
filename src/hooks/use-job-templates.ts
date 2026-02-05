"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { JobTemplate } from "@/src/lib/types/database";

export function useJobTemplates(companyId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["job-templates", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from("job_templates")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as JobTemplate[];
    },
    enabled: !!companyId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<JobTemplate, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("job_templates")
        .insert(template)
        .select()
        .single();
      
      if (error) throw error;
      return data as JobTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-templates"] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("job_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-templates"] });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
  };
}
