import { requireAuth, getUserProfile } from "@/lib/auth"
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

  // Get teams the user has access to
  let teams: Teams[] = []

  if (profile?.is_admin) {
    // Admins can create projects for any team
    const { data } = await supabase.from("teams").select("id, name").order("name")

    teams = data || []
  } else if (profile?.squad_id) {
    // Regular users can only create projects for their team
    const { data: squad } = await supabase.from("squads").select("team_id").eq("id", profile.squad_id).single()

    if (squad) {
      const { data: team } = await supabase.from("teams").select("id, name").eq("id", squad.team_id).single()

      if (team) {
        teams = [team]
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Project</h1>
        <p className="text-muted-foreground">Create a new project</p>
      </div>

      <ProjectForm teams={teams} isEditing={false} />
    </div>
  )
}

