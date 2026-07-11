import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { ADMIN_EMAIL, MEMBER_ROLES, STAFF_ROLES } from "@/lib/admin";
import { getTransporter, sendMail, credentialsEmailHtml } from "@/lib/mailer";

const ALL_ROLES: readonly string[] = [...STAFF_ROLES, ...MEMBER_ROLES];

// Readable temporary password: no ambiguous characters (0/O, 1/l/I).
function generateTempPassword() {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  return Array.from(randomBytes(14), (b) => charset[b % charset.length]).join("");
}

// User management requires the service-role key, which must only ever live in
// server-side environment variables (never NEXT_PUBLIC_*, never in the repo).
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function roleOf(user: User): string {
  if ((user.email ?? "").toLowerCase() === ADMIN_EMAIL) return "admin";
  const role = String(user.user_metadata?.role ?? "");
  return ALL_ROLES.includes(role) ? role : "board";
}

// Any signed-in staff member may LIST the team (needed for task assignment);
// creating, changing, or removing accounts requires an administrator.
// Member accounts (individual/business/ambassador) get neither.
async function requireUser(request: NextRequest, needAdmin: boolean) {
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
  const callerRole = roleOf(data.user);
  if (needAdmin && callerRole !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Only an administrator can manage users." },
        { status: 403 }
      ),
    };
  }
  if (!needAdmin && !(STAFF_ROLES as readonly string[]).includes(callerRole)) {
    return {
      error: NextResponse.json({ error: "Staff access only." }, { status: 403 }),
    };
  }
  return { admin, caller: data.user };
}

export async function GET(request: NextRequest) {
  const auth = await requireUser(request, false);
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
    role: roleOf(u),
  }));
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const auth = await requireUser(request, true);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = ALL_ROLES.includes(body?.role) ? (body.role as string) : "board";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  if (password) {
    // Manual mode: create with a password the admin shares directly.
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    const { data, error } = await auth.admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: { id: data.user.id, email: data.user.email }, invited: false });
  }

  // Standard mode: create the account with a generated temporary password and
  // send ONE email from contact@aacc-usa.org with the link, the email, and the
  // temporary password. Supabase's own email service is never used, so its
  // rate limits do not apply. must_change_password forces a new password on
  // first sign-in.
  const tempPassword = generateTempPassword();
  const { data, error } = await auth.admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role, must_change_password: true },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let welcomed = false;
  if (getTransporter()) {
    try {
      const credentials = credentialsEmailHtml(role, email, tempPassword);
      await sendMail({ to: email, subject: credentials.subject, html: credentials.html });
      welcomed = true;
    } catch {
      welcomed = false;
    }
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    invited: true,
    welcomed,
    // Only exposed when the email could not be sent, so the administrator can
    // deliver the credentials personally (mailto fallback in the dashboard).
    tempPassword: welcomed ? undefined : tempPassword,
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireUser(request, true);
  if ("error" in auth) return auth.error;

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const role = ALL_ROLES.includes(body?.role) ? (body.role as string) : "";
  if (!id || !role) {
    return NextResponse.json({ error: "A user id and a valid role are required." }, { status: 400 });
  }
  const { error } = await auth.admin.auth.admin.updateUserById(id, {
    user_metadata: { role },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireUser(request, true);
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
