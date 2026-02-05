"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/src/lib/supabase/client";
import type { Application, ApplicationStatus } from "@/src/lib/types/database";

export function useApplications(jobId?: string, companyId?: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", jobId, companyId],
    queryFn: async () => {
      let query = supabase
        .from("applications")
        .select(`
          *,
          job:jobs(*),
          candidate:candidates(*)
        `)
        .order("created_at", { ascending: false });
      
      if (jobId) {
        query = query.eq("job_id", jobId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Application[];
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (application: Omit<Application, "id" | "created_at" | "job" | "candidate">) => {
      const { data, error } = await supabase
        .from("applications")
        .insert(application)
        .select(`
          *,
          job:jobs(*),
          candidate:candidates(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const { data, error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id)
        .select(`
          *,
          job:jobs(*),
          candidate:candidates(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
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
