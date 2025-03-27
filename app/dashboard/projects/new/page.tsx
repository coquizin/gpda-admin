import { requireAuth, getUserProfile, getActiveTeam } from "@/lib/auth"
import { ProjectForm } from "../project-form"
import { createClient } from "@/app/utils/supabase/client"
import React from "react"

type Teams = {
  id: string
  name: string
}

export default async function NewProjectPage() {
  const supabase = createClient()
  await requireAuth()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()

  // Get teams the user has access to
  let teams: Teams[] = []

  if (profile?.is_admin) {
    // Admins can post to any team
    const { data } = await supabase.from("teams").select("id, name, description, banner_url, logo_url, team_color, created_at").order("name")

    teams = data || []
  } else {
      if (activeTeam) {
        teams = [activeTeam]
      }
  }

  const {data: squads} = await supabase.from("squads").select("id, name, team_id, created_at").in("team_id", [teams.map(team => team.id)])


  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Project</h1>
        <p className="text-muted-foreground">Create a new project</p>
      </div>

      <ProjectForm teams={teams} isEditing={false} squads={squads || []} />
    </div>
  )
}

