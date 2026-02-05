import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, customerEmail, customerPassword, customerName, adminId } = body;

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify admin
    const { data: adminProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", adminId)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: customerEmail,
      password: customerPassword,
      email_confirm: true,
    });

    if (authError) throw authError;

    // Create or get company
    let companyId: string;
    const { data: existingCompany } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("name", companyName)
      .single();

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      const { data: newCompany, error: companyError } = await supabaseAdmin
        .from("companies")
        .insert({ name: companyName, created_by: adminId })
        .select()
        .single();

      if (companyError) throw companyError;
      companyId = newCompany.id;
    }

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: authData.user.id,
      company_id: companyId,
      role: "customer",
      name: customerName,
    });

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, companyId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
