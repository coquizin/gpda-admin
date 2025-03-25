import { notFound, redirect } from "next/navigation"
import { canEditUser, getActiveTeam, getUserProfile } from "@/lib/auth"
import { UserForm } from "../user-form"
import { createClient } from "@/app/utils/supabase/client"

interface UserEditPageProps {
  params: {
    id: string
  }
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  const supabase = createClient()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  const isAdmin = profile?.is_admin || false
  const { id } = params

  // Check if current user can edit this user
  const canEdit = await canEditUser(id)
  if (!canEdit) {
    redirect("/dashboard/users")
  }

  // Get user data
  const { data: user } = await supabase.from("profiles").select(`*`).eq("id", id).single()

  if (!user) {
    notFound()
  }
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
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update user information and permissions</p>
      </div>

      <UserForm user={user} squads={squads || []} teams={teams || []} isEditing={true} />
    </div>
  )
}

