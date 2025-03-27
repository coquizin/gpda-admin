import { requireAuth, getUserProfile, getActiveTeam } from "@/lib/auth"
import { NewsForm } from "../news-form"
import { Team } from "@/entities/Team"
import { createClient } from "@/app/utils/supabase/client"

export default async function NewNewsPage() {
  const supabase = createClient()
  const session = await requireAuth()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()

  // Get teams the user has access to
  let teams: Team[] = []

  if (profile?.is_admin) {
    // Admins can post to any team
    const { data } = await supabase.from("teams").select("id, name, description, banner_url, logo_url, team_color, created_at").order("name")

    teams = data || []
  } else {
      if (activeTeam) {
        teams = [activeTeam]
      }
  }

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add News</h1>
        <p className="text-muted-foreground">Create a new news article</p>
      </div>

      <NewsForm teams={teams} isEditing={false} userId={session.id} />
    </div>
  )
}

