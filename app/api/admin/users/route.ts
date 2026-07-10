import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";

// User management requires the service-role key, which must only ever live in
// server-side environment variables (never NEXT_PUBLIC_*, never in the repo).
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Only signed-in staff may call these endpoints. The caller proves identity by
// sending their session access token; we verify it against Supabase Auth.
async function requireStaff(request: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return {
      error: NextResponse.json(
        { error: "User management is not configured (SUPABASE_SERVICE_ROLE_KEY missing)." },
        { status: 501 }
      ),
    };
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: NextResponse.json({ error: "Not signed in." }, { status: 401 }) };
  }
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Session invalid or expired." }, { status: 401 }) };
  }
  // User management is reserved for the administrator account.
  if (data.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return {
      error: NextResponse.json(
        { error: "Only the administrator can manage users." },
        { status: 403 }
      ),
    };
  }
  return { admin, caller: data.user };
}

export async function GET(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("error" in auth) return auth.error;

  const { data, error } = await auth.admin.auth.admin.listUsers({ perPage: 200 });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || password.length < 8) {
    return NextResponse.json(
      { error: "A valid email and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const { data, error } = await auth.admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireStaff(request);
  if ("error" in auth) return auth.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing user id." }, { status: 400 });
  }
  if (id === auth.caller.id) {
    return NextResponse.json({ error: "You cannot remove your own account." }, { status: 400 });
  }

  const { error } = await auth.admin.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
