import { createClient } from "@/app/utils/supabase/server"
import { createId } from "@paralleldrive/cuid2"

export interface Invitation {
  id: string
  email: string
  role: "admin" | "president" | "vice_president" | "coordinator" | "member"
  squad_id: string | null
  team_id: string | null
  expires_at: string
  used: boolean
  created_at: string
}

export async function createInvitation(
  email: string,
  role: "admin" | "president" | "vice_president" | "coordinator" | "member",
  squad_id: string | null,
  team_id: string | null,
  expiresInDays = 7,
) {
  const supabase = await createClient()
  const id = createId()
  const expires_at = new Date()
  expires_at.setDate(expires_at.getDate() + expiresInDays)

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      id,
      email,
      role,
      squad_id,
      team_id,
      expires_at: expires_at.toISOString(),
      used: false,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getInvitation(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("invitations")
    .select(`
      *,
      team:team_id (
        name
      ),
      squad:squad_id (
        name
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error

  return data
}

export async function validateInvitation(id: string) {
  const invitation = await getInvitation(id)

  if (!invitation) {
    return { valid: false, message: "Invitation not found" }
  }

  if (invitation.used) {
    return { valid: false, message: "Invitation has already been used" }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false, message: "Invitation has expired" }
  }

  return { valid: true, invitation }
}

export async function markInvitationAsUsed(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("invitations").update({ used: true }).eq("id", id)

  if (error) throw error
}

