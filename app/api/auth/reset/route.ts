import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getTransporter, sendMail, resetEmailHtml } from "@/lib/mailer";

// Self-hosted password reset: a one-time token stored in password_resets and a
// link emailed from contact@aacc-usa.org. Supabase's mailer is never used.
// The table has RLS with no policies, so only this server route can touch it.

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Best-effort throttle per instance: one request per email per minute.
const lastRequestAt = new Map<string, number>();

// Step 1: request a reset link. Always answers ok so the endpoint never
// reveals whether an email has an account.
export async function POST(request: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Password reset is not configured (SUPABASE_SERVICE_ROLE_KEY missing)." },
      { status: 501 }
    );
  }
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const last = lastRequestAt.get(email) ?? 0;
  if (Date.now() - last < 60_000) {
    return NextResponse.json({ ok: true });
  }
  lastRequestAt.set(email, Date.now());

  // Look the account up quietly; if it does not exist we still answer ok.
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const user = data?.users.find((u) => (u.email ?? "").toLowerCase() === email);
  if (user && getTransporter()) {
    const { data: token, error } = await admin
      .from("password_resets")
      .insert({ user_id: user.id, email })
      .select("token")
      .single();
    if (!error && token) {
      const resetUrl = `${request.nextUrl.origin}/portal/reset?token=${token.token}`;
      const reset = resetEmailHtml(resetUrl);
      try {
        await sendMail({ to: email, subject: reset.subject, html: reset.html });
      } catch {
        // Silent: the generic response below never confirms account existence.
      }
    }
  }
  return NextResponse.json({ ok: true });
}

// Step 2: consume the token and set the new password.
export async function PUT(request: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Password reset is not configured (SUPABASE_SERVICE_ROLE_KEY missing)." },
      { status: 501 }
    );
  }
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "A reset token and a password of at least 8 characters are required." },
      { status: 400 }
    );
  }

  const { data: row } = await admin
    .from("password_resets")
    .select("token, user_id, expires_at, used_at")
    .eq("token", token)
    .maybeSingle();
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired. Request a new one." },
      { status: 400 }
    );
  }

  const { data: existing } = await admin.auth.admin.getUserById(row.user_id);
  const { error: updateError } = await admin.auth.admin.updateUserById(row.user_id, {
    password,
    user_metadata: { ...(existing?.user?.user_metadata ?? {}), must_change_password: false },
  });
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }
  await admin.from("password_resets").update({ used_at: new Date().toISOString() }).eq("token", token);
  return NextResponse.json({ ok: true });
}
