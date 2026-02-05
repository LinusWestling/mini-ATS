"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface AdminContextType {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
}

const AdminContext = createContext<AdminContextType>({
  selectedCompanyId: null,
  setSelectedCompanyId: () => {},
});

export const useAdmin = () => useContext(AdminContext);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize from localStorage or URL search param
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin_view_as");
    const urlParam = searchParams.get("viewAs");
    
    if (urlParam) {
      setSelectedCompanyIdState(urlParam);
      localStorage.setItem("admin_view_as", urlParam);
    } else if (stored) {
      setSelectedCompanyIdState(stored);
      // Sync URL with stored preference if we're on a route that might need it
      const params = new URLSearchParams(searchParams.toString());
      params.set("viewAs", stored);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, []);

  const setSelectedCompanyId = (id: string | null) => {
    setSelectedCompanyIdState(id);
    const params = new URLSearchParams(searchParams.toString());
    
    if (id) {
      localStorage.setItem("admin_view_as", id);
      params.set("viewAs", id);
    } else {
      localStorage.removeItem("admin_view_as");
      params.delete("viewAs");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Sync state with URL changes (e.g. back button)
  useEffect(() => {
    const viewAs = searchParams.get("viewAs");
    if (viewAs && viewAs !== selectedCompanyId) {
      setSelectedCompanyIdState(viewAs);
      localStorage.setItem("admin_view_as", viewAs);
    } else if (!viewAs && selectedCompanyId) {
      // If URL is cleared but we have state, sync URL
      const params = new URLSearchParams(searchParams.toString());
      params.set("viewAs", selectedCompanyId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams]);

  return (
    <AdminContext.Provider value={{ selectedCompanyId, setSelectedCompanyId }}>
      {children}
    </AdminContext.Provider>
  );
}
