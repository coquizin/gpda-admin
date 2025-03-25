import { getActiveTeam, getUserProfile, requireAdmin } from "@/lib/auth"
import { UserForm } from "../user-form"
import { createClient } from "@/app/utils/supabase/client"

export default async function NewUserPage() {
  const supabase = createClient()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  const isAdmin = profile?.is_admin || false

  await requireAdmin()
  let query = null
  
  // Get all squads for dropdown
  if (isAdmin) {
      query = supabase
      .from("squads")
      .select(`
        id,
        name,
        team_id,
        teams:team_id (
          id,
          name
        )
      `)
      .order("name")
  } else {
      query = supabase
      .from("squads")
      .select(`
        id,
        name,
        team_id,
        teams:team_id (
          id,
          name
        )
      `)
      .eq("team_id", activeTeam?.id)
      .order("name")
  }

  const { data: squads }: any = await query

  // Get all teams for dropdown
  if (isAdmin) {
      query = supabase
      .from("teams")
      .select(`
        *,
        squads (
          id,
          name
        )
      `)
      .order("name")
  } else {
    query = supabase
      .from("teams")
      .select(`
        *,
        squads (
          id,
          name
        )
      `)
      .eq("id", activeTeam?.id)
      .order("name")
  }


  const { data: teams } = await query

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
        <p className="text-muted-foreground">Create a new user account</p>
      </div>

      <UserForm squads={squads || []} teams={teams || []} isEditing={false} />
    </div>
  )
}

