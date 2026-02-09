import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const interviewId = searchParams.get("interviewId");

  if (!interviewId) {
    return NextResponse.json({ error: "Interview ID is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("interview_feedback")
    .select("*")
    .eq("interview_id", interviewId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("interview_feedback")
    .insert(body)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
