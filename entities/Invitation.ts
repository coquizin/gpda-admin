export type InvitationRole = "admin" | "president" | "vice_president" | "coordinator" | "member"

export interface Invitation {
  id: string
  email: string
  role: InvitationRole
  team_id: string | null
  squad_id: string | null
  expires_at: string
  used: boolean
  created_at: string
}

export interface InvitationInsert {
  id?: string
  email: string
  role: InvitationRole
  team_id?: string | null
  squad_id?: string | null
  expires_at: string
  used?: boolean
  created_at?: string
}

export interface InvitationUpdate {
  id?: string
  email?: string
  role?: InvitationRole
  team_id?: string | null
  squad_id?: string | null
  expires_at?: string
  used?: boolean
  created_at?: string
} 