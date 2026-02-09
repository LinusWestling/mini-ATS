import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/src/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, customerEmail, customerPassword, customerName } = body;

    // 1. Verify the caller is an authenticated ADMIN using their cookie
    // We use a standard server client for this (respects Auth & RLS)
    const supabaseCaller = await createServerClient();
    const { data: { user: callerUser }, error: userError } = await supabaseCaller.auth.getUser();

    if (userError || !callerUser) {
      return NextResponse.json({ error: "Unauthorized: No session" }, { status: 401 });
    }

    const { data: adminProfile } = await supabaseCaller
      .from("profiles")
      .select("role")
      .eq("id", callerUser.id)
      .single();

    if (adminProfile?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Not an admin" }, { status: 403 });
    }

    // 2. Perform the privileged operation using Service Role
    // (Only reachable if step 1 passes)
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
        .insert({ name: companyName, created_by: callerUser.id })
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
