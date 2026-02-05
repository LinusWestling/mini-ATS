export type ApplicationStatus = "new" | "screening" | "interview" | "offer" | "rejected" | string;
export type UserRole = "admin" | "customer";

export interface Company {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  logo_url?: string | null;
  description?: string | null;
}

export interface RecruitmentStep {
  id: string;
  company_id: string;
  label: string;
  value: string;
  order: number;
  color: string;
  is_system: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  location?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  created_at: string;
  company?: Company;
}

export interface JobTemplate {
  id: string;
  company_id: string;
  name: string;
  content: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  company_id: string;
  name: string;
  linkedin_url: string | null;
  email: string | null;
  phone: string | null;
  cv_url?: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  created_at: string;
  job?: Job;
  candidate?: Candidate;
}
