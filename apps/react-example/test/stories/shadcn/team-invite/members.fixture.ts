export const TEAM_MEMBERS = ["김태희", "김철수", "이영희", "박민수"] as const;

export type TeamMember = (typeof TEAM_MEMBERS)[number];

export const TEAM_ROLES = [
  { value: "member", label: "멤버" },
  { value: "admin", label: "관리자" },
] as const;

export type TeamRole = (typeof TEAM_ROLES)[number]["value"];

export type TeamInvite = {
  member: TeamMember;
  role: TeamRole;
};
