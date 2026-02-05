"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { Job } from "@/src/lib/types/database";

export function useJobs(companyId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", companyId],
    queryFn: async () => {
      let query = supabase.from("jobs").select(`
        *,
        company:companies(*)
      `).order("created_at", { ascending: false });
      
      if (companyId) {
        query = query.eq("company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Job & { company: Company })[];
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (job: Omit<Job, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
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
