export interface Project {
  id: string
  name: string
  description: string
  image_url: string | null
  team_id: string | null
  squad_id: string | null
  created_at: string
}
  
export interface ProjectInsert {
  id?: string
  name: string
  description: string
  image_url?: string | null
  team_id?: string | null
  squad_id?: string | null
  created_at?: string
}
  
export interface ProjectUpdate {
  id?: string
  name?: string
  description?: string
  image_url?: string | null
  team_id?: string | null
  squad_id?: string | null
  created_at?: string
} 