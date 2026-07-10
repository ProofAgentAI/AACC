"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Row = Record<string, unknown>;

const inputClasses =
  "rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy";

const priorityColors: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  normal: "bg-navy-50 text-navy",
  low: "bg-surface text-muted",
};

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
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

export default function TasksManager({ onNotice }: { onNotice: (msg: string) => void }) {
  const [tasks, setTasks] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState<{ email: string; role: string }[]>([]);

  useEffect(() => {
    supabase?.auth.getSession().then(async ({ data }) => {
      setEmail(data.session?.user.email ?? "");
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
      .order("status", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false });
    setLoading(false);
    if (error) {
      onNotice(`Could not load tasks: ${error.message}`);
    } else {
      setTasks((data as Row[]) ?? []);
    }
  }, [onNotice]);

  useEffect(() => {
    load();
  }, [load]);

  async function addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    const { error } = await supabase.from("staff_tasks").insert({
      title,
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
    const status = task.status === "done" ? "open" : "done";
    const { error } = await supabase.from("staff_tasks").update({ status }).eq("id", task.id);
    if (error) {
      onNotice(`Update failed: ${error.message}`);
    } else {
      setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, status } : t)));
    }
  }

  async function remove(task: Row) {
    if (!supabase) return;
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    const { error } = await supabase.from("staff_tasks").delete().eq("id", task.id);
    if (error) {
      onNotice(`Delete failed: ${error.message}`);
    } else {
      setTasks((all) => all.filter((t) => t.id !== task.id));
    }
  }

  const visible = tasks.filter((t) => {
    if (!showDone && t.status === "done") return false;
    if (mineOnly && t.assigned_to !== email) return false;
    return true;
  });

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

      {/* Filters */}
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
        <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-navy">
          <input
            type="checkbox"
            checked={showDone}
            onChange={(e) => setShowDone(e.target.checked)}
            className="h-4 w-4 accent-[#0B1F3A]"
          />
          Show completed
        </label>
      </div>

      {/* Task list */}
      <ul className="mt-4 space-y-2">
        {visible.length === 0 && !loading && (
          <li className="rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center text-sm text-muted">
            No tasks here. Add one above to keep the team on track.
          </li>
        )}
        {visible.map((task) => (
          <li
            key={String(task.id)}
            className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-card ${
              isOverdue(task) ? "border-red-200" : "border-navy-100"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(task)}
              className="shrink-0 text-muted transition-colors hover:text-green-600"
              aria-label={task.status === "done" ? "Mark as open" : "Mark as done"}
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
            {Boolean(task.due_date) && (
              <span
                className={`shrink-0 text-xs font-semibold ${
                  isOverdue(task) ? "text-red-600" : "text-muted"
                }`}
              >
                {formatDate(task.due_date)}
              </span>
            )}
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                priorityColors[String(task.priority)] ?? "bg-surface text-muted"
              }`}
            >
              {String(task.priority)}
            </span>
            <button
              type="button"
              onClick={() => remove(task)}
              className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-red-600"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
