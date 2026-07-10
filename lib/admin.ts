// Staff roles for the back office.
// - admin: everything, including Users, Billing, and Approvals
// - board: full operations except Users, Billing, and Approvals
// - staff: Dashboard, Common Tasks, Content (submit for approval), Events
export const ADMIN_EMAIL = "contact@aacc-usa.org";

export type StaffRole = "admin" | "board" | "staff";

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  board: "Board Member",
  staff: "Staff",
};

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

export function roleOf(user: UserLike): StaffRole {
  if (!user) return "staff";
  if ((user.email ?? "").toLowerCase() === ADMIN_EMAIL) return "admin";
  const role = user.user_metadata?.role;
  return role === "admin" || role === "board" || role === "staff" ? role : "board";
}

export function isAdminUser(user: UserLike): boolean {
  return roleOf(user) === "admin";
}
