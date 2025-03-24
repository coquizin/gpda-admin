export type SquadRole = "coordinator" | "member"

export interface UserSquad {
  id: string
  user_id: string
  squad_id: string
  role: SquadRole
}

export interface UserSquadInsert {
  id?: string
  user_id: string
  squad_id: string
  role: SquadRole
}

export interface UserSquadUpdate {
  id?: string
  user_id?: string
  squad_id?: string
  role?: SquadRole
} 