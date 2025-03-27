import { notFound } from "next/navigation"
import { getActiveTeam, getUserProfile, requireAuth } from "@/lib/auth"
import { NewsForm } from "../news-form"
import { createClient } from "@/app/utils/supabase/client"
import { Team } from "@/entities"


export default async function NewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAuth()
  const { id } = await params
  const supabase = createClient()
  const session = await requireAuth()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  // Get news data
  const { data: news } = await supabase.from("news").select("*").eq("id", id).single()

  if (!news) {
    notFound()
  }

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
    <div className="space-y-6 px-4 lg:px-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit News</h1>
        <p className="text-muted-foreground">Update news article</p>
      </div>

      <NewsForm news={news} teams={teams || []} isEditing={true} />
    </div>
  )
}

