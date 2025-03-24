export interface Team {
  id: string
  name: string
  description: string | null
  banner_url: string | null
  logo_url: string | null
  team_color: string | null
  created_at: string
}

export interface TeamInsert {
  id?: string
  name: string
  description?: string | null
  banner_url?: string | null
  logo_url?: string | null
  team_color?: string | null
  created_at?: string
}

export interface TeamUpdate {
  id?: string
  name?: string
  description?: string | null
  banner_url?: string | null
  logo_url?: string | null
  team_color?: string | null
  created_at?: string
} 