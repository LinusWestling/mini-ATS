import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName } = body;

    if (!email || !password || !name || !companyName) {
      return NextResponse.json({ error: "Alla fält krävs" }, { status: 400 });
    }

    // We use a service role client to perform these operations atomically and bypass RLS for the initial setup
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

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirming for simplicity in this demo, or set to false to require email verification
      user_metadata: { full_name: name },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Kunde inte skapa användare");

    const userId = authData.user.id;

    // 2. Create Company
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        created_by: userId,
      })
      .select()
      .single();

    if (companyError) {
      // Cleanup auth user if company creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw companyError;
    }

    // 3. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        company_id: company.id,
        role: "customer",
        name: name,
      });

    if (profileError) {
      // Cleanup if profile creation fails (cascading deletes might handle this if company is deleted, but manual cleanup is safer)
      await supabaseAdmin.from("companies").delete().eq("id", company.id);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw profileError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Registrering misslyckades" }, { status: 500 });
  }
}
