"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateCustomerParams {
  companyName: string;
  customerEmail: string;
  customerPassword: string;
  customerName: string;
  adminId: string;
}

interface CreateCustomerResponse {
  success: boolean;
  companyId: string;
  error?: string;
}

export function useAdminActions() {
  const queryClient = useQueryClient();

  const createCustomerMutation = useMutation({
    mutationFn: async (params: CreateCustomerParams) => {
      const response = await fetch("/api/admin/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa kundkonto");
      }

      return data as CreateCustomerResponse;
    },
    onSuccess: () => {
      // Invalidate companies list to show the new company immediately
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  return {
    createCustomer: createCustomerMutation.mutateAsync,
    isCreating: createCustomerMutation.isPending,
  };
}
