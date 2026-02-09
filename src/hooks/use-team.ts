"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import type { Profile, Invite } from "@/src/lib/types/database";

export function useTeam(companyId?: string) {
  const queryClient = useQueryClient();

  // Fetch members
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["team-members", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await fetch(`/api/team/members?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch team members");
      }
      return res.json() as Promise<Profile[]>;
    },
    enabled: !!companyId,
  });

  // Fetch pending invites
  const { data: invites, isLoading: invitesLoading } = useQuery({
    queryKey: ["team-invites", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await fetch(`/api/team/invites?companyId=${companyId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch team invites");
      }
      return res.json() as Promise<Invite[]>;
    },
    enabled: !!companyId,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: Invite["role"] }) => {
      if (!companyId) throw new Error("Company ID is required");
      
      const res = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, companyId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create invite");
      }
      return res.json() as Promise<Invite>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites", companyId] });
    },
  });

  // Delete invite mutation
  const deleteInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const res = await fetch(`/api/team/invites/${inviteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete invite");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites", companyId] });
    },
  });

  return {
    members: members || [],
    invites: invites || [],
    isLoading: membersLoading || invitesLoading,
    createInvite: createInviteMutation.mutate,
    deleteInvite: deleteInviteMutation.mutate,
  };
}