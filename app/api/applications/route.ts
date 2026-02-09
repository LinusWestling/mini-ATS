import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const jobId = searchParams.get("jobId");
  const companyId = searchParams.get("companyId");

  let query = supabase
    .from("applications")
    .select(`
      *,
      job:jobs!inner(*),
      candidate:candidates(*)
    `)
    .order("created_at", { ascending: false });

  if (jobId) {
    query = query.eq("job_id", jobId);
  } else if (companyId) {
    query = query.eq("job.company_id", companyId);
  } else {
    // If neither is provided, we probably shouldn't return everything, but for now lets return empty or rely on RLS
    // However, the hook logic seemed to require one or the other mostly.
    // Let's rely on RLS if no filter is applied, but ideally we force a filter.
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("applications")
    .insert(body)
    .select(`
      *,
      job:jobs(*),
      candidate:candidates(*)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
