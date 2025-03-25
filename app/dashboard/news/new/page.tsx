import { requireAuth, getUserProfile } from "@/lib/auth"
import { NewsForm } from "../news-form"
import { createClient } from "@/app/utils/supabase/server"
import { Team } from "@/entities/Team"
export default async function NewNewsPage() {
  const supabase = await createClient()
  const session = await requireAuth()
  const profile = await getUserProfile()

  // Get teams the user has access to
  let teams: Team[] = []

  if (profile?.is_admin) {
    // Admins can post to any team
    const { data } = await supabase.from("teams").select("id, name, description, banner_url, logo_url, team_color, created_at").order("name")

    teams = data || []
  } else if (profile?.squad_id) {
    // Regular users can only post to their team
    const { data: squad } = await supabase.from("squads").select("team_id").eq("id", profile.squad_id).single()

    if (squad) {
      const { data: team } = await supabase.from("teams").select("id, name, description, banner_url, logo_url, team_color, created_at").eq("id", squad.team_id).single()

      if (team) {
        teams = [team]
      }
    }
  }

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add News</h1>
        <p className="text-muted-foreground">Create a new news article</p>
      </div>

      <NewsForm teams={teams} isEditing={false} userId={session.user.id} />
    </div>
  )
}

