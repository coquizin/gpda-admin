export interface News {
  id: string
  title: string
  content: string
  image_url: string | null
  team_id: string | null
  squad_id: string | null
  author_id: string
  created_at: string
}

export interface NewsInsert {
  id?: string
  title: string
  content: string
  image_url?: string | null
  team_id?: string | null
  squad_id?: string | null
  author_id: string
  created_at?: string
}

export interface NewsUpdate {
  id?: string
  title?: string
  content?: string
  image_url?: string | null
  team_id?: string | null
  squad_id?: string | null
  author_id?: string
  created_at?: string
} 