export type TeamRole = "president" | "vice_president" | "member"

export interface UserTeam {
  id: string
  user_id: string
  team_id: string
  role: TeamRole
}

export interface UserTeamInsert {
  id?: string
  user_id: string
  team_id: string
  role: TeamRole
}

export interface UserTeamUpdate {
  id?: string
  user_id?: string
  team_id?: string
  role?: TeamRole
} 