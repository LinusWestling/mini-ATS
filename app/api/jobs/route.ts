import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, apiError } from "@/src/lib/api-utils";
import { JobSchema } from "@/src/lib/validation/schemas";

export async function GET(request: NextRequest) {
  // Attempt to authenticate, but don't fail if unauthenticated
  const { profile } = await getAuthenticatedUser();
  
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  let query = supabase
    .from("jobs")
    .select(`
      *,
      company:companies(*)
    `)
    .order("created_at", { ascending: false });

  // If authenticated, we might want to scope to the user's company (for the dashboard)
  // BUT the requirement is that the landing page (which might pass no params) sees everything.
  // CodeRabbit warned about "GET without companyId returns all candidates".
  // For JOBS, returning all jobs is the desired "public feed" behavior.
  // However, for the dashboard, we want to see only *our* jobs.
  
  if (profile) {
    // Authenticated user
    if (profile.role === "admin") {
      // Admin can filter by companyId if provided, or see all
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
    } else {
      // Regular customer: strictly scope to their company
      // UNLESS they are explicitly asking for the public feed?
      // Usually, the /dashboard calls this with no params? No, useJobs() passes companyId if available.
      // Let's look at useJobs:
      // const { data: jobs } = useQuery({ queryKey: ["jobs", companyId] ... })
      // useJobs(companyId) is called.
      
      // If the dashboard calls it, it should provide the companyId (or we derive it).
      // If the landing page calls it, it provides NO companyId.
      
      if (companyId) {
        // If a specific company is requested:
        // If it's their own company, allow it.
        if (companyId === profile.company_id) {
           query = query.eq("company_id", companyId);
        } else {
           // Asking for another company's jobs? 
           // If jobs are public, this is fine!
           query = query.eq("company_id", companyId);
        }
      } else {
         // No companyId provided.
         // If on dashboard, we usually want OUR jobs.
         // If on landing page, we want ALL jobs.
         // This ambiguity is tricky.
         // However, the dashboard explicitly passes `effectiveCompanyId` to `useJobs`.
         // So `useJobs` will append `?companyId=...`.
         // The landing page `useJobs()` has no args, so no `companyId` param.
         // So: No param = Public Feed (All Jobs).
         // Param = Filter by Company (Public or Private).
      }
    }
  } else {
    // Unauthenticated: Public Feed
    if (companyId) {
      query = query.eq("company_id", companyId);
    }
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { profile, status, error } = await getAuthenticatedUser();
  if (error || !profile) return apiError(error || "Unauthorized", status);

  const body = await request.json();
  const result = JobSchema.safeParse(body);

  if (!result.success) {
    return apiError(result.error.issues[0].message);
  }

  // SECURITY: Ensure user is inserting for their own company
  if (profile.role !== "admin" && result.data.company_id !== profile.company_id) {
    return apiError("Unauthorized: Cannot create job for another company", 403);
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("jobs")
    .insert(result.data)
    .select()
    .single();

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}
