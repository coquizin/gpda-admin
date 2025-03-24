import { notFound, redirect } from "next/navigation"
import { isTeamStaff } from "@/lib/auth"
import { createClient } from "@/app/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StaffEditForm } from "../../staff-edit-form"
import { Team, User } from "@/entities"

type TeamWithRelations = Team & {
  president: Pick<User, 'id' | 'name' | 'email'> | null
  vice_president: Pick<User, 'id' | 'name' | 'email'> | null
}

type UserTeamWithUser = {
  user: Pick<User, 'id' | 'name' | 'email'>
}

interface StaffEditPageProps {
  params: {
    id: string
  }
}

export default async function StaffEditPage({ params }: StaffEditPageProps) {
  const supabase = await createClient()
  const { id } = params

  // Check if user can edit team staff
  const canEditStaff = await isTeamStaff(id)

  if (!canEditStaff) {
    redirect("/dashboard/team")
  }

  // Get team details
  const { data: team } = await supabase
    .from("teams")
    .select(`
      *,
      president:user_teams!inner(
        user:profiles(
          id,
          name,
          email
        )
      ),
      vice_president:user_teams!inner(
        user:profiles(
          id,
          name,
          email
        )
      )
    `)
    .eq("id", id)
    .eq('user_teams.role', 'president')
    .single()

  if (!team) {
    notFound()
  }

  // Format team data
  const formattedTeam = {
    ...team,
    president: team.president?.[0]?.user || null,
    vice_president: team.vice_president?.[0]?.user || null
  } as TeamWithRelations

  // Get team coordinators
  const { data: coordinators } = await supabase
    .from("user_teams")
    .select(`
      user:profiles(
        id,
        name,
        email
      )
    `)
    .eq("team_id", id)
    .eq("role", "coordinator") as { data: UserTeamWithUser[] | null }

  // Get all team members for selection
  const { data: teamMembers } = await supabase
    .from("user_teams")
    .select(`
      user:profiles(
        id,
        name,
        email
      )
    `)
    .eq("team_id", id) as { data: UserTeamWithUser[] | null }

  // Get all users for selection
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("id, name, email")
    .order("name") as { data: Pick<User, 'id' | 'name' | 'email'>[] | null }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Staff Positions</h1>
        <p className="text-muted-foreground">Manage team leadership positions for {formattedTeam.name}</p>
      </div>

      <Card className="bg-card border-border/40">
        <CardHeader>
          <CardTitle>Staff Positions</CardTitle>
          <CardDescription>Assign president, vice-president, and coordinators for your team</CardDescription>
        </CardHeader>
        <CardContent>
          <StaffEditForm
            team={formattedTeam}
            coordinators={coordinators?.map((c) => c.user) || []}
            teamMembers={teamMembers?.map((tm) => tm.user) || []}
            allUsers={allUsers || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}

