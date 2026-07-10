import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ADMIN_EMAIL } from "@/lib/admin";
import { getTransporter, sendMail, newsletterHtml, FROM_ADDRESS, type NewsletterSection } from "@/lib/mailer";

const BATCH_SIZE = 40;

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Sending a campaign to the full subscriber list is reserved for the administrator.
export async function POST(request: NextRequest) {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Sending is not configured (SUPABASE_SERVICE_ROLE_KEY missing)." },
      { status: 501 }
    );
  }
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Session invalid or expired." }, { status: 401 });
  }
  const role =
    (userData.user.email ?? "").toLowerCase() === ADMIN_EMAIL
      ? "admin"
      : userData.user.user_metadata?.role;
  if (role !== "admin") {
    return NextResponse.json(
      { error: "Only an administrator can send to the subscriber list." },
      { status: 403 }
    );
  }

  if (!getTransporter()) {
    return NextResponse.json(
      {
        error:
          "Email is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS to the environment.",
      },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Missing newsletter id." }, { status: 400 });

  const { data: newsletter, error: newsletterError } = await admin
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (newsletterError || !newsletter) {
    return NextResponse.json({ error: "Newsletter not found." }, { status: 404 });
  }
  if (newsletter.status === "sent") {
    return NextResponse.json({ error: "This newsletter was already sent." }, { status: 400 });
  }

  const { data: subscribers, error: subscribersError } = await admin
    .from("newsletter_subscribers")
    .select("email");
  if (subscribersError) {
    return NextResponse.json({ error: subscribersError.message }, { status: 500 });
  }
  const emails = Array.from(
    new Set((subscribers ?? []).map((s) => String(s.email).toLowerCase()).filter(Boolean))
  );
  if (emails.length === 0) {
    return NextResponse.json({ error: "There are no subscribers yet." }, { status: 400 });
  }

  const html = newsletterHtml({
    subject: String(newsletter.subject),
    headline: newsletter.headline ? String(newsletter.headline) : undefined,
    intro: newsletter.intro ? String(newsletter.intro) : undefined,
    mainImage: newsletter.main_image ? String(newsletter.main_image) : undefined,
    mainImageCredit: newsletter.main_image_credit
      ? String(newsletter.main_image_credit)
      : undefined,
    sections: (newsletter.items as NewsletterSection[]) ?? [],
  });

  // Recipients go in BCC batches so addresses are never exposed to each other.
  let sent = 0;
  const failures: string[] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);
    try {
      await sendMail({
        to: FROM_ADDRESS,
        bcc: batch,
        subject: String(newsletter.subject),
        html,
      });
      sent += batch.length;
    } catch (error) {
      failures.push(error instanceof Error ? error.message : "send failed");
    }
  }

  if (sent > 0) {
    await admin
      .from("newsletters")
      .update({ status: "sent", sent_at: new Date().toISOString(), sent_count: sent })
      .eq("id", id);
  }

  if (sent === 0) {
    return NextResponse.json(
      { error: `Sending failed: ${failures[0] ?? "unknown error"}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ sent, total: emails.length, failures: failures.length });
}
