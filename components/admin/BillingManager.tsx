"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeDollarSign, CircleDollarSign, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

const inputClasses =
  "w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const PAYMENT_METHODS = [
  { value: "card", label: "Card / Online" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "transfer", label: "Bank Transfer / Zelle" },
  { value: "other", label: "Other" },
];

function money(cents: unknown) {
  return `$${(Number(cents ?? 0) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function invoiceNumber(inv: Row) {
  const year = new Date(String(inv.created_at)).getFullYear();
  return `INV-${year}-${String(inv.number).padStart(4, "0")}`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(value.includes("T") ? value : `${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// 'overdue' is derived: sent, unpaid, and past due.
function derivedStatus(inv: Row): string {
  if (inv.status === "sent" && typeof inv.due_date === "string" && inv.due_date) {
    if (inv.due_date < new Date().toISOString().slice(0, 10)) return "overdue";
  }
  return String(inv.status);
}

const statusColors: Record<string, string> = {
  draft: "bg-surface text-muted",
  sent: "bg-navy-50 text-navy",
  paid: "bg-green-50 text-green-700",
  overdue: "bg-red-50 text-red-700",
  void: "bg-surface text-muted line-through",
};

const emptyInvoice: Row = {
  billed_name: "",
  billed_email: "",
  organization: "",
  description: "",
  amount: "",
  due_date: "",
  payment_link: "",
  notes: "",
};

export default function BillingManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [invoices, setInvoices] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [payFor, setPayFor] = useState<Row | null>(null);
  const [method, setMethod] = useState("transfer");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load invoices: ${error.message}`);
    } else {
      setInvoices((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  function set(field: string, value: unknown) {
    setDraft((d) => (d ? { ...d, [field]: value } : d));
  }

  async function save() {
    if (!supabase || !draft) return;
    const name = String(draft.billed_name ?? "").trim();
    const email = String(draft.billed_email ?? "").trim().toLowerCase();
    const description = String(draft.description ?? "").trim();
    const amount = Math.round(parseFloat(String(draft.amount ?? "0")) * 100);
    if (!name || !email || !description || !Number.isFinite(amount) || amount <= 0) {
      onNotice("Name, email, description, and a positive amount are required.");
      return;
    }
    setSaving(true);
    const payload: Row = {
      billed_name: name,
      billed_email: email,
      organization: String(draft.organization ?? "").trim() || null,
      description,
      amount_cents: amount,
      due_date: String(draft.due_date ?? "") || null,
      payment_link: String(draft.payment_link ?? "").trim() || null,
      notes: String(draft.notes ?? "").trim() || null,
    };
    const result = draft.id
      ? await supabase.from("invoices").update(payload).eq("id", draft.id)
      : await supabase.from("invoices").insert(payload);
    setSaving(false);
    if (result.error) {
      onNotice(`Save failed: ${result.error.message}`);
      return;
    }
    onNotice("Invoice saved.");
    setDraft(null);
    load();
  }

  function sendInvoice(inv: Row) {
    const num = invoiceNumber(inv);
    const lines = [
      `Dear ${String(inv.billed_name).split(" ")[0]},`,
      "",
      `Please find your invoice from the Algerian American Chamber of Commerce USA (AACC-USA):`,
      "",
      `Invoice: ${num}`,
      `Description: ${inv.description}`,
      `Amount due: ${money(inv.amount_cents)}`,
      inv.due_date ? `Due date: ${formatDate(inv.due_date)}` : "",
      inv.payment_link ? `` : "",
      inv.payment_link ? `Pay online: ${inv.payment_link}` : "",
      "",
      "Thank you for supporting the chamber.",
      "",
      "AACC-USA",
      "contact@aacc-usa.org",
    ].filter((l) => l !== "");
    window.location.href = `mailto:${inv.billed_email}?subject=${encodeURIComponent(
      `AACC-USA Invoice ${num}`
    )}&body=${encodeURIComponent(lines.join("\n"))}`;
    if (inv.status === "draft") {
      supabase
        ?.from("invoices")
        .update({ status: "sent" })
        .eq("id", inv.id)
        .then(() => load());
    }
  }

  async function markPaid() {
    if (!supabase || !payFor) return;
    const { error } = await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: method })
      .eq("id", payFor.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
      return;
    }
    onNotice(`Recorded payment for ${invoiceNumber(payFor)}.`);
    setPayFor(null);
    load();
  }

  async function voidInvoice(inv: Row) {
    if (!supabase) return;
    if (!window.confirm(`Void invoice ${invoiceNumber(inv)}? It stays on record as void.`)) return;
    const { error } = await supabase.from("invoices").update({ status: "void" }).eq("id", inv.id);
    if (error) onNotice(`Update failed: ${error.message}`);
    else load();
  }

  async function remove(inv: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete invoice ${invoiceNumber(inv)} permanently?`)) return;
    const { error } = await supabase.from("invoices").delete().eq("id", inv.id);
    if (error) onNotice(`Delete failed: ${error.message}`);
    else load();
  }

  const active = invoices.filter((i) => i.status !== "void");
  const collected = active
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.amount_cents ?? 0), 0);
  const outstanding = active
    .filter((i) => i.status === "sent")
    .reduce((sum, i) => sum + Number(i.amount_cents ?? 0), 0);
  const overdueCount = active.filter((i) => derivedStatus(i) === "overdue").length;

  if (draft) {
    return (
      <div className="mt-6 max-w-3xl rounded-2xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">
            {draft.id ? `Edit ${invoiceNumber(draft)}` : "New Invoice"}
          </h2>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-full p-2 text-muted hover:bg-surface hover:text-navy"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Billed To *</label>
            <input
              type="text"
              value={String(draft.billed_name ?? "")}
              onChange={(e) => set("billed_name", e.target.value)}
              className={inputClasses}
              placeholder="Member or business name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Email *</label>
            <input
              type="email"
              value={String(draft.billed_email ?? "")}
              onChange={(e) => set("billed_email", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-navy">Organization</label>
            <input
              type="text"
              value={String(draft.organization ?? "")}
              onChange={(e) => set("organization", e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Amount (USD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={String(draft.amount ?? "")}
                onChange={(e) => set("amount", e.target.value)}
                className={inputClasses}
                placeholder="295.00"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-navy">Due Date</label>
              <input
                type="date"
                value={String(draft.due_date ?? "")}
                onChange={(e) => set("due_date", e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Description *</label>
            <input
              type="text"
              value={String(draft.description ?? "")}
              onChange={(e) => set("description", e.target.value)}
              className={inputClasses}
              placeholder="e.g. Business Membership dues 2026, Gold sponsorship, Summit table"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">
              Payment Link (optional — Stripe, PayPal, Zelle...)
            </label>
            <input
              type="url"
              value={String(draft.payment_link ?? "")}
              onChange={(e) => set("payment_link", e.target.value)}
              className={inputClasses}
              placeholder="https://buy.stripe.com/..."
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-navy">Internal Notes</label>
            <textarea
              rows={2}
              value={String(draft.notes ?? "")}
              onChange={(e) => set("notes", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-6 py-3 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Invoice"}
          </button>
          <button
            type="button"
            onClick={() => setDraft(null)}
            className="rounded-lg border border-navy-200 px-6 py-3 text-sm font-semibold text-navy hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Finance summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Collected</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-green-600">
            {money(collected)}
          </p>
        </div>
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Outstanding</p>
          <p className="mt-2 font-heading text-3xl font-extrabold text-navy">
            {money(outstanding)}
          </p>
        </div>
        <div
          className={`rounded-2xl border bg-white p-5 shadow-card ${
            overdueCount > 0 ? "border-red-200" : "border-navy-100"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Overdue</p>
          <p
            className={`mt-2 font-heading text-3xl font-extrabold ${
              overdueCount > 0 ? "text-red-600" : "text-navy"
            }`}
          >
            {overdueCount}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">
          Send invoices by email, record payments, and track dues. Paste a Stripe or PayPal link
          to make an invoice payable online.
        </p>
        <button
          type="button"
          onClick={() => setDraft({ ...emptyInvoice })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-100 bg-white shadow-card">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-surface text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3 text-start">Invoice</th>
              <th className="px-4 py-3 text-start">Billed To</th>
              <th className="px-4 py-3 text-start">Description</th>
              <th className="px-4 py-3 text-start">Amount</th>
              <th className="px-4 py-3 text-start">Due</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  <CircleDollarSign className="mx-auto mb-2 h-6 w-6" />
                  No invoices yet. Create the first one.
                </td>
              </tr>
            )}
            {invoices.map((inv) => {
              const status = derivedStatus(inv);
              return (
                <tr key={String(inv.id)} className="border-b border-navy-50">
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-navy">
                    {invoiceNumber(inv)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{String(inv.billed_name)}</span>
                    <span className="block text-xs text-muted">{String(inv.billed_email)}</span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">
                    {String(inv.description)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold tabular-nums text-navy">
                    {money(inv.amount_cents)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted">
                    {formatDate(inv.due_date) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        statusColors[status] ?? "bg-surface text-navy"
                      }`}
                    >
                      {status}
                    </span>
                    {inv.status === "paid" && inv.payment_method ? (
                      <span className="block pt-1 text-[10px] uppercase tracking-wide text-muted">
                        {String(inv.payment_method)} · {formatDate(inv.paid_at)}
                      </span>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {inv.status !== "paid" && inv.status !== "void" && (
                      <>
                        <button
                          type="button"
                          onClick={() => sendInvoice(inv)}
                          className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                          aria-label="Send by email"
                          title="Send by email"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMethod("transfer");
                            setPayFor(inv);
                          }}
                          className="rounded-lg p-2 text-muted hover:bg-green-50 hover:text-green-600"
                          aria-label="Record payment"
                          title="Record payment"
                        >
                          <BadgeDollarSign className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...inv, amount: String(Number(inv.amount_cents ?? 0) / 100) })}
                          className="rounded-lg p-2 text-muted hover:bg-navy-50 hover:text-navy"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => voidInvoice(inv)}
                          className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                          aria-label="Void"
                          title="Void"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(inv)}
                      className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Record payment dialog */}
      {payFor && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Record payment"
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setPayFor(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="font-heading text-lg font-bold text-navy">
              Record Payment — {invoiceNumber(payFor)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {String(payFor.billed_name)} · {money(payFor.amount_cents)}
            </p>
            <div className="mt-5 space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-medium ${
                    method === m.value
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-navy-200 text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="method"
                    value={m.value}
                    checked={method === m.value}
                    onChange={() => setMethod(m.value)}
                    className="h-4 w-4 accent-[#007A3D]"
                  />
                  {m.label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={markPaid}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
              >
                Mark as Paid
              </button>
              <button
                type="button"
                onClick={() => setPayFor(null)}
                className="rounded-lg border border-navy-200 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
