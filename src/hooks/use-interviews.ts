"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Interview, InterviewTemplate, InterviewFeedback } from "@/src/lib/types/database";

export function useInterviews(processId?: string) {
  const queryClient = useQueryClient();

  // Fetch interviews for a process
  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ["interviews", processId],
    queryFn: async () => {
      if (!processId) return [];
      const res = await fetch(`/api/interviews?processId=${processId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch interviews");
      }
      return res.json() as Promise<any[]>;
    },
    enabled: !!processId,
  });

  // Fetch feedback for an interview
  const fetchFeedback = async (interviewId: string) => {
    const res = await fetch(`/api/interviews/feedback?interviewId=${interviewId}`);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to fetch feedback");
    }
    return res.json() as Promise<InterviewFeedback[]>;
  };

  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (interview: Omit<Interview, "id" | "created_at">) => {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interview),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create interview");
      }
      return res.json() as Promise<Interview>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews", processId] });
    },
  });

  // Create feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: Omit<InterviewFeedback, "id" | "created_at">[]) => {
      const res = await fetch("/api/interviews/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit feedback");
      }
      return res.json() as Promise<InterviewFeedback[]>;
    },
  });

  // Delete interview mutation
  const deleteInterviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete interview");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews", processId] });
      queryClient.invalidateQueries({ queryKey: ["candidate-interviews"] });
    },
  });

  return {
    interviews: interviews || [],
    isLoading: interviewsLoading,
    createInterview: createInterviewMutation.mutate,
    submitFeedback: submitFeedbackMutation.mutate,
    deleteInterview: deleteInterviewMutation.mutate,
    fetchFeedback,
  };
}

export function useInterviewTemplates(companyId?: string) {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["interview-templates", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await fetch(`/api/interviews/templates?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch interview templates");
      }
      return res.json() as Promise<InterviewTemplate[]>;
    },
    enabled: !!companyId,
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<InterviewTemplate, "id" | "created_at">) => {
      const res = await fetch("/api/interviews/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create interview template");
      }
      return res.json() as Promise<InterviewTemplate>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interview-templates", companyId] });
    },
  });

  return {
    templates: templates || [],
    isLoading,
    createTemplate: createTemplateMutation.mutate,
  };
}

export function useCandidateInterviews(candidateId?: string) {
  const queryClient = useQueryClient();

  const { data: interviews, isLoading } = useQuery({
    queryKey: ["candidate-interviews", candidateId],
    queryFn: async () => {
      if (!candidateId) return [];
      
      const res = await fetch(`/api/interviews/candidate/${candidateId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch candidate interviews");
      }
      return res.json();
    },
    enabled: !!candidateId,
  });

  // Delete interview mutation
  const deleteInterviewMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete interview");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate-interviews", candidateId] });
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
    },
  });

  return {
    interviews: interviews || [],
    isLoading,
    deleteInterview: deleteInterviewMutation.mutate,
  };
}