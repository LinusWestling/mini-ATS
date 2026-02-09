import { createClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const { error } = await supabase
    .from("recruitment_steps")
    .upsert(body, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
