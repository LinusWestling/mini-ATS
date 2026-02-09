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
  const isValidUuid = companyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyId);

  // SECURITY: Enforce tenant scoping
  // For admins, if no companyId is provided, we should probably return all or empty list.
  
  if (profile.role === "admin") {
    let query = supabase.from("candidates").select("*").order("created_at", { ascending: false });
    
    if (isValidUuid) {
      query = query.eq("company_id", companyId);
    } 
    // If not a valid UUID (like "all" or missing), we return all candidates for admins

    const { data, error: dbError } = await query;
    if (dbError) {
      console.error("GET candidates (admin) error:", dbError);
      return apiError(dbError.message, 500);
    }
    return NextResponse.json(data);
  }

  // Regular user: strictly scoped to their company
  if (!profile.company_id) {
    return NextResponse.json([]);
  }

  const { data, error: dbError } = await supabase
    .from("candidates")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  if (dbError) {
    console.error("GET candidates (user) error:", dbError);
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
    console.error("POST candidate validation error:", result.error.format());
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
    console.error("POST candidate DB error:", dbError);
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}
