export type ApplicationStatus = "new" | "screening" | "interview" | "offer" | "rejected" | string;
export type UserRole = "admin" | "customer";

export interface Company {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  logo_url?: string | null;
  description?: string | null;
  auto_reply_enabled?: boolean;
  auto_reply_subject?: string;
  auto_reply_body?: string;
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
  notification_preferences?: {
    new_candidate: boolean;
    status_change: boolean;
    email_notifications: boolean;
  };
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
  extra_fields?: { label: string, value: string }[];
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

export interface Invite {
  id: string;
  company_id: string;
  email: string;
  token: string;
  role: UserRole;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
}

export interface Department {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

export interface RecruitmentProcess {
  id: string;
  company_id: string;
  department_id: string | null;
  role_name: string;
  description: string | null;
  kravprofil: any;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  department?: Department;
}

export interface InterviewTemplate {
  id: string;
  company_id: string;
  name: string;
  questions: any[];
  created_at: string;
}

export interface Interview {
  id: string;
  process_id: string;
  candidate_id: string;
  template_id: string | null;
  title: string;
  description: string | null;
  notes: string | null;
  status: 'planned' | 'completed';
  created_at: string;
  candidate?: Candidate;
}

export interface InterviewFeedback {
  id: string;
  interview_id: string;
  question_text: string;
  score: number;
  comment: string | null;
  created_at: string;
}
