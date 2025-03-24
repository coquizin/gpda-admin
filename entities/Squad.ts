export interface Squad {
  id: string
  name: string
  team_id: string
  created_at: string
}

export interface SquadInsert {
  id?: string
  name: string
  team_id: string
  created_at?: string
}

export interface SquadUpdate {
  id?: string
  name?: string
  team_id?: string
  created_at?: string
} 