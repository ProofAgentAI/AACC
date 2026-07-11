// Account roles across the back office (/admin) and the member portal (/portal).
//
// Staff roles (back office):
// - admin: everything, including Users, Billing, and Approvals
// - board: full operations except Users, Billing, and Approvals
// - staff: Dashboard, Common Tasks, Content (submit for approval), Events
//
// Member roles (portal, invite-only):
// - individual: Individual Member — events calendar, directory, news, resources
// - business: Business Member — same portal access as individual
// - ambassador: State Ambassador — member access plus the chamber CRM
export const ADMIN_EMAIL = "contact@aacc-usa.org";

export type StaffRole = "admin" | "board" | "staff";
export type MemberRole = "individual" | "business" | "ambassador";
export type AppRole = StaffRole | MemberRole;

export const STAFF_ROLES: readonly StaffRole[] = ["admin", "board", "staff"];
export const MEMBER_ROLES: readonly MemberRole[] = ["individual", "business", "ambassador"];

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Admin",
  board: "Board Member",
  staff: "Staff",
  individual: "Individual Member",
  business: "Business Member",
  ambassador: "State Ambassador",
};

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null | undefined;

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isMemberRole(role: string): role is MemberRole {
  return (MEMBER_ROLES as readonly string[]).includes(role);
}

// Accounts created before roles existed carry no metadata; they are early
// staff accounts, so the fallback is 'board' (never a member role).
export function appRoleOf(user: UserLike): AppRole {
  if (!user) return "staff";
  if ((user.email ?? "").toLowerCase() === ADMIN_EMAIL) return "admin";
  const role = String(user.user_metadata?.role ?? "");
  if (isStaffRole(role) || isMemberRole(role)) return role;
  return "board";
}

// Back-office role of a user; member accounts resolve to the most limited
// staff role so nothing in /admin ever widens for them (they are redirected
// to /portal before this matters).
export function roleOf(user: UserLike): StaffRole {
  const role = appRoleOf(user);
  return isStaffRole(role) ? role : "staff";
}

export function isAdminUser(user: UserLike): boolean {
  return appRoleOf(user) === "admin";
}

export function isStaffUser(user: UserLike): boolean {
  return isStaffRole(appRoleOf(user));
}

export function isMemberUser(user: UserLike): boolean {
  return isMemberRole(appRoleOf(user));
}
