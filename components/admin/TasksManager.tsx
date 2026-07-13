"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Circle,
  History,
  ListTodo,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isAdminUser } from "@/lib/admin";

type Row = Record<string, unknown>;

type Comment = {
  id: string;
  task_id: string;
  created_at: string;
  author: string;
  comment: string;
};

const inputClasses =
  "rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const priorityColors: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  normal: "bg-navy-50 text-navy",
  low: "bg-surface text-muted",
};

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  const date = value.includes("T") ? new Date(value) : new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isOverdue(task: Row) {
  return (
    task.status === "open" &&
    typeof task.due_date === "string" &&
    task.due_date !== "" &&
    task.due_date <= new Date().toISOString().slice(0, 10)
  );
}

// Tasks never disappear: open tasks on top, completed ones stay listed under
// Previous Tasks with their status. Each task opens a detail dialog where the
// assignee (or an administrator) comments and marks it done.
export default function TasksManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [tasks, setTasks] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [team, setTeam] = useState<{ email: string; role: string }[]>([]);
  const [detail, setDetail] = useState<Row | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    supabase?.auth.getSession().then(async ({ data }) => {
      setEmail(data.session?.user.email ?? "");
      setIsAdmin(isAdminUser(data.session?.user));
      // Board members and staff for the assignee dropdown; falls back to a
      // plain email field when the roster cannot load.
      const token = data.session?.access_token;
      if (!token) return;
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null);
      if (res?.ok) {
        const body = await res.json();
        setTeam(
          (body.users ?? []).map((u: { email: string; role: string }) => ({
            email: u.email,
            role: u.role,
          }))
        );
      }
    });
  }, []);

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("staff_tasks")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load tasks: ${error.message}`);
      return;
    }
    setTasks((data as Row[]) ?? []);
    // Comment counts power the bubble on each row; tolerated silently until
    // schema-v23 runs.
    const { data: commentRows } = await supabase.from("task_comments").select("task_id");
    const counts: Record<string, number> = {};
    for (const row of (commentRows as { task_id: string }[]) ?? []) {
      counts[row.task_id] = (counts[row.task_id] ?? 0) + 1;
    }
    setCommentCounts(counts);
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  // Only the person the task is assigned to (or an administrator, or whoever
  // created it) can complete or reopen it.
  const canComplete = (task: Row) =>
    isAdmin || task.assigned_to === email || task.created_by === email;

  async function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    const { error } = await supabase.from("staff_tasks").insert({
      title,
      details: String(data.get("details") ?? "").trim() || null,
      assigned_to: String(data.get("assignee") ?? "").trim() || email || null,
      due_date: String(data.get("due") ?? "") || null,
      priority: String(data.get("priority") ?? "normal"),
      created_by: email || null,
    });
    if (error) {
      onNotice(`Could not add task: ${error.message}`);
      return;
    }
    form.reset();
    load();
  }

  async function toggle(task: Row) {
    if (!supabase) return;
    if (!canComplete(task)) {
      onNotice("Only the task owner or an administrator can change its status.");
      return;
    }
    const done = task.status !== "done";
    const patch = {
      status: done ? "done" : "open",
      completed_at: done ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("staff_tasks").update(patch).eq("id", task.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, ...patch } : t)));
      setDetail((current) => (current && current.id === task.id ? { ...current, ...patch } : current));
      onNotice(done ? `Task completed: ${task.title}` : `Task reopened: ${task.title}`);
    }
  }

  async function remove(task: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete task "${task.title}" permanently? Completed tasks stay in Previous Tasks — deleting removes it entirely.`))
      return;
    const { error } = await supabase.from("staff_tasks").delete().eq("id", task.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      setTasks((all) => all.filter((t) => t.id !== task.id));
      setDetail(null);
    }
  }

  async function openDetail(task: Row) {
    setDetail(task);
    setComments([]);
    setCommentText("");
    if (!supabase) return;
    const { data } = await supabase
      .from("task_comments")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true });
    setComments((data as Comment[]) ?? []);
  }

  async function addComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase || !detail) return;
    const text = commentText.trim();
    if (!text) return;
    setSendingComment(true);
    const { data, error } = await supabase
      .from("task_comments")
      .insert({ task_id: detail.id, author: email, comment: text })
      .select("*")
      .single();
    setSendingComment(false);
    if (error) {
      onNotice(`Could not add the comment: ${error.message}`);
      return;
    }
    setComments((current) => [...current, data as Comment]);
    setCommentCounts((current) => ({
      ...current,
      [String(detail.id)]: (current[String(detail.id)] ?? 0) + 1,
    }));
    setCommentText("");
  }

  const byMine = (t: Row) => !mineOnly || t.assigned_to === email;
  const openTasks = tasks.filter((t) => t.status === "open").filter(byMine);
  const previousTasks = tasks
    .filter((t) => t.status === "done")
    .filter(byMine)
    .sort((a, b) => String(b.completed_at ?? b.created_at).localeCompare(String(a.completed_at ?? a.created_at)));

  const renderRow = (task: Row) => (
    <li key={String(task.id)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => openDetail(task)}
        onKeyDown={(e) => e.key === "Enter" && openDetail(task)}
        className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-card transition-colors hover:bg-surface ${
          isOverdue(task) ? "border-red-200" : "border-navy-100"
        }`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle(task);
          }}
          className={`shrink-0 transition-colors ${
            canComplete(task) ? "text-muted hover:text-green-600" : "cursor-default text-navy-100"
          }`}
          aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
          title={
            canComplete(task)
              ? task.status === "done"
                ? "Reopen"
                : "Mark as done"
              : "Only the task owner or an administrator can complete this task"
          }
        >
          {task.status === "done" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-semibold ${
              task.status === "done" ? "text-muted line-through" : "text-navy"
            }`}
          >
            {String(task.title)}
          </p>
          <p className="truncate text-xs text-muted">
            {task.assigned_to ? String(task.assigned_to) : "Unassigned"}
          </p>
        </div>
        {(commentCounts[String(task.id)] ?? 0) > 0 && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
            <MessageSquare className="h-3.5 w-3.5" /> {commentCounts[String(task.id)]}
          </span>
        )}
        {task.status === "done" ? (
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Completed{task.completed_at ? ` ${formatDate(task.completed_at)}` : ""}
          </span>
        ) : isOverdue(task) ? (
          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            Overdue{task.due_date ? ` · ${formatDate(task.due_date)}` : ""}
          </span>
        ) : (
          Boolean(task.due_date) && (
            <span className="shrink-0 text-xs font-semibold text-muted">
              {formatDate(task.due_date)}
            </span>
          )
        )}
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
            priorityColors[String(task.priority)] ?? "bg-surface text-muted"
          }`}
        >
          {String(task.priority)}
        </span>
        {(isAdmin || task.created_by === email) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove(task);
            }}
            className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </li>
  );

  return (
    <div className="mt-6">
      {/* Quick add */}
      <form
        onSubmit={addTask}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-card"
      >
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-navy">New Task *</label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Call the venue for the summit"
            className={`${inputClasses} w-full`}
          />
        </div>
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-navy">Details</label>
          <input
            name="details"
            type="text"
            placeholder="Optional context for the owner"
            className={`${inputClasses} w-full`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Assign To</label>
          {team.length > 0 ? (
            <select name="assignee" defaultValue={email} className={`${inputClasses} w-56`}>
              {team.map((member) => (
                <option key={member.email} value={member.email}>
                  {member.email}
                  {member.role === "admin"
                    ? " (Admin)"
                    : member.role === "board"
                      ? " (Board)"
                      : " (Staff)"}
                </option>
              ))}
            </select>
          ) : (
            <input
              name="assignee"
              type="email"
              placeholder={email || "staff email"}
              className={`${inputClasses} w-48`}
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Due</label>
          <input name="due" type="date" className={inputClasses} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Priority</label>
          <select name="priority" defaultValue="normal" className={inputClasses}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-green-500 hover:to-green-400"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      {/* Filter */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-navy">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="h-4 w-4 accent-[#007A3D]"
          />
          My tasks only
        </label>
        <span className="text-xs text-muted">
          Click a task to see its details and comments.
        </span>
      </div>

      {/* Open tasks */}
      <h2 className="mt-6 inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
        <ListTodo className="h-4 w-4" /> Open Tasks ({openTasks.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {openTasks.length === 0 && !loading && (
          <li className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-muted">
            No open tasks. Add one above to keep the team on track.
          </li>
        )}
        {openTasks.map(renderRow)}
      </ul>

      {/* Previous tasks: completed work stays visible with its status */}
      <h2 className="mt-10 inline-flex items-center gap-2 font-heading text-base font-bold text-navy">
        <History className="h-4 w-4" /> Previous Tasks ({previousTasks.length})
      </h2>
      <ul className="mt-3 space-y-2">
        {previousTasks.length === 0 && !loading && (
          <li className="rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center text-sm text-muted">
            Completed tasks will stay here with their status.
          </li>
        )}
        {previousTasks.map(renderRow)}
      </ul>

      {/* Task detail dialog with comments */}
      {detail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={String(detail.title)}
        >
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={() => setDetail(null)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setDetail(null)}
              className="absolute end-4 top-4 z-10 rounded-full bg-white/90 p-2 text-muted shadow hover:bg-surface hover:text-navy"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="bg-navy-900 px-8 py-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold">
                {detail.status === "done" ? "Completed task" : "Open task"}
              </p>
              <h2 className="mt-1 pe-8 font-heading text-lg font-bold text-white">
                {String(detail.title)}
              </h2>
            </div>
            <div className="p-8">
              {Boolean(detail.details) && (
                <p className="mb-5 whitespace-pre-wrap rounded-xl border border-navy-100 bg-surface p-4 text-sm leading-relaxed text-ink">
                  {String(detail.details)}
                </p>
              )}
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Owner</dt>
                  <dd className="mt-0.5 truncate text-ink">
                    {String(detail.assigned_to ?? "Unassigned")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Created by</dt>
                  <dd className="mt-0.5 truncate text-ink">{String(detail.created_by ?? "—")}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">Due</dt>
                  <dd className={`mt-0.5 ${isOverdue(detail) ? "font-semibold text-red-600" : "text-ink"}`}>
                    {detail.due_date ? formatDate(detail.due_date) : "—"}
                    {isOverdue(detail) ? " (overdue)" : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {detail.status === "done" ? "Completed" : "Priority"}
                  </dt>
                  <dd className="mt-0.5 capitalize text-ink">
                    {detail.status === "done"
                      ? formatDateTime(detail.completed_at) || "—"
                      : String(detail.priority)}
                  </dd>
                </div>
              </dl>

              {canComplete(detail) && (
                <button
                  type="button"
                  onClick={() => toggle(detail)}
                  className={`mt-6 inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold ${
                    detail.status === "done"
                      ? "border border-navy-200 text-navy hover:bg-surface"
                      : "bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {detail.status === "done" ? "Reopen Task" : "Mark as Done"}
                </button>
              )}

              {/* Comments */}
              <h3 className="mt-8 inline-flex items-center gap-2 font-heading text-sm font-bold text-navy">
                <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
              </h3>
              <ul className="mt-3 space-y-3">
                {comments.length === 0 && (
                  <li className="rounded-xl border border-dashed border-navy-200 p-4 text-center text-xs text-muted">
                    No comments yet. Updates and blockers go here.
                  </li>
                )}
                {comments.map((comment) => (
                  <li key={comment.id} className="rounded-xl border border-navy-100 p-3.5">
                    <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                      <span className="font-semibold text-navy">{comment.author}</span>
                      {formatDateTime(comment.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                      {comment.comment}
                    </p>
                  </li>
                ))}
              </ul>
              <form onSubmit={addComment} className="mt-4 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className={`${inputClasses} min-w-0 flex-1`}
                />
                <button
                  type="submit"
                  disabled={sendingComment || !commentText.trim()}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
