// Server-side email via the chamber's mailbox (Namecheap Private Email).
// Configure with server-only env vars (never NEXT_PUBLIC_):
//   SMTP_HOST=mail.privateemail.com
//   SMTP_PORT=465
//   SMTP_USER=contact@aacc-usa.org
//   SMTP_PASS=<the mailbox password>
import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

export const FROM_ADDRESS = process.env.SMTP_USER ?? "contact@aacc-usa.org";
export const FROM = `"AACC-USA" <${FROM_ADDRESS}>`;

export function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(options: Mail.Options) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error("SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing).");
  }
  return transporter.sendMail({ from: FROM, ...options });
}

// Branded, email-client-safe wrapper (tables + inline styles).
export function brandedEmail(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:#F7F8FA;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F8FA;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td style="background-color:#0B1F3A;padding:20px 28px;">
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff;">AACC<span style="color:#C9A227;">-</span>USA</span>
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;color:#AFC0D6;text-transform:uppercase;padding-top:2px;">
              Algerian American Chamber of Commerce
            </div>
          </td>
        </tr>
        <tr>
          <td style="height:4px;background:linear-gradient(90deg,#007A3D,#C9A227,#D71920,#0B1F3A);font-size:0;line-height:0;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:15px;line-height:1.6;">
            ${title ? `<h1 style="margin:0 0 16px;font-size:22px;color:#0B1F3A;">${title}</h1>` : ""}
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;background-color:#F7F8FA;border-top:1px solid #e5e7eb;font-family:Arial,sans-serif;font-size:12px;color:#6B7280;line-height:1.6;">
            Algerian American Chamber of Commerce USA · <a href="https://aacc-usa.org" style="color:#007A3D;">aacc-usa.org</a> · <a href="mailto:contact@aacc-usa.org" style="color:#007A3D;">contact@aacc-usa.org</a><br/>
            To unsubscribe from chamber emails, reply with the word UNSUBSCRIBE.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type NewsletterItem = {
  title: string;
  description?: string;
  url?: string;
  image?: string;
};

export function newsletterHtml(subject: string, intro: string, items: NewsletterItem[]) {
  const itemsHtml = items
    .map((item) => {
      const titleHtml = item.url
        ? `<a href="${item.url}" style="color:#0B1F3A;text-decoration:none;">${item.title}</a>`
        : item.title;
      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        ${item.image ? `<tr><td><a href="${item.url ?? "https://aacc-usa.org"}"><img src="${item.image}" alt="" width="100%" style="display:block;max-height:280px;object-fit:cover;"/></a></td></tr>` : ""}
        <tr><td style="padding:16px 18px;">
          <h2 style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:18px;color:#0B1F3A;">${titleHtml}</h2>
          ${item.description ? `<p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:14px;color:#374151;line-height:1.6;">${item.description}</p>` : ""}
          ${item.url ? `<a href="${item.url}" style="font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#007A3D;">Read more →</a>` : ""}
        </td></tr>
      </table>`;
    })
    .join("");

  const body = `
    ${intro ? `<p style="margin:0 0 20px;">${intro.replace(/\n/g, "<br/>")}</p>` : ""}
    ${itemsHtml}
  `;
  return brandedEmail(subject, body);
}

export function welcomeEmailHtml(role: string) {
  const intros: Record<string, string> = {
    admin:
      "Welcome aboard as an <strong>Administrator</strong> of the Algerian American Chamber of Commerce USA. You have full access to the chamber's back office, including approvals, billing, and user management.",
    board:
      "Welcome to the <strong>founding board</strong> of the Algerian American Chamber of Commerce USA. We are honored to have your leadership as we build the bridge between Algerian talent, trade, and opportunity.",
    staff:
      "Welcome to the <strong>AACC-USA team</strong>. You now have access to the chamber's back office to contribute content, manage tasks, and support our programs.",
  };
  const body = `
    <p>Dear colleague,</p>
    <p>${intros[role] ?? intros.staff}</p>
    <p>You will receive a separate email with a secure link to set your password. Once set, sign in anytime at
    <a href="https://aacc-usa.org/admin" style="color:#007A3D;">aacc-usa.org/admin</a>.</p>
    <p>Warm regards,<br/><strong>Fouad Bousetouane</strong><br/>President, AACC-USA</p>
  `;
  const titles: Record<string, string> = {
    admin: "Welcome to AACC-USA — Administrator Access",
    board: "Welcome to the AACC-USA Founding Board",
    staff: "Welcome to the AACC-USA Team",
  };
  return { subject: titles[role] ?? titles.staff, html: brandedEmail("", body) };
}
