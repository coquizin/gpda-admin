import { getUserProfile, canInviteUsers } from "@/lib/auth"
import { InvitationForm } from "../invitation-form"
import { redirect } from "next/navigation"
import { Team } from "@/entities/Team"
import { Squad } from "@/entities/Squad"
import { createClient } from "@/app/utils/supabase/client"

export default async function NewInvitationPage() {
  const supabase = createClient()
  const profile = await getUserProfile()
  const canInvite = await canInviteUsers()

  if (!canInvite || !profile) {
    redirect("/dashboard")
  }

  // Get teams and squads the user has access to
  let teams: Team[] = []
  let squads: Squad[] = []

  if (profile.is_admin) {
    // Admins can invite to any team and squad
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name, description, banner_url, logo_url, team_color, created_at")
      .order("name") as { data: Team[] | null }

    teams = teamsData || []

    const { data: squadsData } = await supabase
      .from("squads")
      .select(`
        id,
        name,
        team_id,
        created_at,
        team:teams (
          name
        )
      `)
      .order("name") as { data: (Squad & { team: { name: string } })[] | null }

    squads = squadsData || []
  } else if (profile.squad?.team?.id) {
    // Team presidents and coordinators can only invite to their team
    const teamId = profile.squad.team.id

    const { data: teamData } = await supabase
      .from("teams")
      .select("id, name, description, banner_url, logo_url, team_color, created_at")
      .eq("id", teamId)
      .single() as { data: Team | null }

    if (teamData) {
      teams = [teamData]
    }

    const { data: squadsData } = await supabase
      .from("squads")
      .select(`
        id,
        name,
        team_id,
        created_at,
        team:teams (
          name
        )
      `)
      .eq("team_id", teamId)
      .order("name") as { data: (Squad & { team: { name: string } })[] | null }

    squads = squadsData || []
  }

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Invitation</h1>
        <p className="text-muted-foreground">Invite new members to join your team</p>
      </div>

      <InvitationForm teams={teams} squads={squads} userId={profile.id} />
    </div>
  )
}

