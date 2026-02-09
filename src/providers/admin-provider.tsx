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

const isValidUuid = (id: string | null) => {
  if (!id) return false;
  const trimmed = id.trim();
  if (trimmed === "all" || trimmed === "") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(trimmed);
};

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
      if (isValidUuid(urlParam)) {
        setSelectedCompanyIdState(urlParam.trim());
        localStorage.setItem("admin_view_as", urlParam.trim());
      } else if (urlParam === "all") {
        setSelectedCompanyIdState(null);
        localStorage.removeItem("admin_view_as");
      }
    } else if (stored) {
      if (isValidUuid(stored)) {
        setSelectedCompanyIdState(stored.trim());
        const params = new URLSearchParams(searchParams.toString());
        params.set("viewAs", stored.trim());
        router.replace(`${pathname}?${params.toString()}`);
      } else {
        localStorage.removeItem("admin_view_as");
      }
    }
  }, []);

  const setSelectedCompanyId = (id: string | null) => {
    const targetId = isValidUuid(id) ? id!.trim() : null;
    setSelectedCompanyIdState(targetId);
    const params = new URLSearchParams(searchParams.toString());
    
    if (targetId) {
      localStorage.setItem("admin_view_as", targetId);
      params.set("viewAs", targetId);
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
      if (isValidUuid(viewAs)) {
        setSelectedCompanyIdState(viewAs.trim());
        localStorage.setItem("admin_view_as", viewAs.trim());
      } else if (viewAs === "all") {
        setSelectedCompanyIdState(null);
        localStorage.removeItem("admin_view_as");
      }
    } else if (!viewAs && selectedCompanyId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("viewAs", selectedCompanyId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchParams, selectedCompanyId]);

  return (
    <AdminContext.Provider value={{ selectedCompanyId, setSelectedCompanyId }}>
      {children}
    </AdminContext.Provider>
  );
}