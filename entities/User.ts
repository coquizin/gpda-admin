export interface User {
  id: string
  name: string
  email: string
  is_admin: boolean,
  avatar_url: string
  banner_url: string
  created_at: string
}

export interface UserInsert {
  id?: string
  name: string
  email: string
  is_admin?: boolean
  created_at?: string
}

export interface UserUpdate {
  id?: string
  name?: string
  email?: string
  is_admin?: boolean
  created_at?: string
} 