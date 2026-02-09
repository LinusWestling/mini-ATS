import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, apiError } from "@/src/lib/api-utils";
import { CandidateSchema } from "@/src/lib/validation/schemas";

export async function GET(request: NextRequest) {
  const { profile, status, error } = await getAuthenticatedUser();
  if (error || !profile) return apiError(error || "Unauthorized", status);

  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");

  // SECURITY: Enforce tenant scoping
  const effectiveCompanyId = profile.role === "admin" ? (companyId || profile.company_id) : profile.company_id;

  const { data, error: dbError } = await supabase
    .from("candidates")
    .select("*")
    .eq("company_id", effectiveCompanyId)
    .order("created_at", { ascending: false });

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const { profile, status, error } = await getAuthenticatedUser();
  if (error || !profile) return apiError(error || "Unauthorized", status);

  const body = await request.json();
  const result = CandidateSchema.safeParse(body);

  if (!result.success) {
    return apiError(result.error.issues[0].message);
  }

  // SECURITY: Ensure user is inserting for their own company
  if (profile.role !== "admin" && result.data.company_id !== profile.company_id) {
    return apiError("Unauthorized: Cannot create candidate for another company", 403);
  }

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("candidates")
    .insert(result.data)
    .select()
    .single();

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}