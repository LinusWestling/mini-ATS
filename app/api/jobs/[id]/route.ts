import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, apiError } from "@/src/lib/api-utils";
import { JobSchema } from "@/src/lib/validation/schemas";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, status, error } = await getAuthenticatedUser();
  if (error || !profile) return apiError(error || "Unauthorized", status);

  const body = await request.json();
  // For PUT, we use partial validation or just pick fields. 
  // Let's use a strict allowlist of fields from the schema.
  const result = JobSchema.partial().safeParse(body);

  if (!result.success) {
    return apiError(result.error.issues[0].message);
  }

  const supabase = await createClient();

  // SECURITY: Check ownership before update (defense in depth beyond RLS)
  const { data: job } = await supabase.from("jobs").select("company_id").eq("id", id).single();
  if (!job || (profile.role !== "admin" && job.company_id !== profile.company_id)) {
    return apiError("Unauthorized", 403);
  }

  const { data, error: dbError } = await supabase
    .from("jobs")
    .update(result.data)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, status, error } = await getAuthenticatedUser();
  if (error || !profile) return apiError(error || "Unauthorized", status);

  const supabase = await createClient();

  // SECURITY: Check ownership
  const { data: job } = await supabase.from("jobs").select("company_id").eq("id", id).single();
  if (!job || (profile.role !== "admin" && job.company_id !== profile.company_id)) {
    return apiError("Unauthorized", 403);
  }

  const { error: dbError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id);

  if (dbError) {
    return apiError(dbError.message, 500);
  }

  return NextResponse.json({ success: true });
}