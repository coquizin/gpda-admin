import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserProfile, getActiveTeam, isTeamStaff } from "@/lib/auth"
import { createClient } from "@/app/utils/supabase/server"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Users, UserSquare, Edit, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Team, User, Squad, UserTeam, UserSquad } from "@/entities"

type TeamWithRelations = Team & {
  president: Pick<User, 'id' | 'name' | 'email'> | null
  vice_president: Pick<User, 'id' | 'name' | 'email'> | null
}

type SquadWithMembers = Squad & {
  members: Array<{
    user: Pick<User, 'id' | 'name' | 'email'>
  }>
}

type TeamMember = Pick<User, 'id' | 'name' | 'email'> & {
  teamRole?: string
  squad?: string | null
}

type UserTeamWithUser = {
  user: Pick<User, 'id' | 'name' | 'email'>
  role: string
}

export default async function TeamProfilePage() {
  const supabase = await createClient()
  const profile = await getUserProfile()
  const team = await getActiveTeam()

  if (!team) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Team Selected</CardTitle>
            <CardDescription>Please select a team from the dropdown in the sidebar.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Check if user can edit team staff
  const canEditStaff = await isTeamStaff(team.id)

  // Get team staff
  const { data: staff, error } = await supabase
  .from("user_teams")
  .select(`
    role,
    user:profiles (
      id,
      name,
      email
    )
  `)
  .eq("team_id", team.id)
  .in("role", ["president", "vice_president"]);

  // Get team coordinators TODO FIX COORDINATORS
  const { data: coordinators } = await supabase
    .from("user_teams")
    .select(`
      user:profiles(
        id,
        name,
        email
      )
    `)
    .eq("team_id", team.id)
    .eq("role", "coordinator") as { data: UserTeamWithUser[] | null }

  // Get team squads with members
  const { data: squads } = await supabase
    .from("squads")
    .select(`
      *,
      members:user_squads(
        user:profiles(
          id,
          name,
          email
        )
      )
    `)
    .eq("team_id", team.id) as { data: SquadWithMembers[] | null }

  // Get team members
  const { data: teamMembers } = await supabase
    .from("user_teams")
    .select(`
      user:profiles(
        id,
        name,
        email
      ),
      role
    `)
    .eq("team_id", team.id) as { data: UserTeamWithUser[] | null }

  // Format team data
  const formattedTeam = team ? {
    ...team,
    president: staff?.find(s => s.role === "president")?.user || null,
    vice_president: staff?.find(s => s.role === "vice_president")?.user || null,
  } : null

  console.log("Formatted Team:", team)
  // Format squads data
  const formattedSquads = squads || []

  // Format team members
  const formattedTeamMembers = teamMembers?.map(tm => ({
    ...tm.user,
    teamRole: tm.role
  })) || []

  // Flatten members from all squads
  const squadMembers = formattedSquads.flatMap((squad) =>
    squad.members.map((member) => ({
      ...member.user,
      squad: squad.name,
    }))
  )

  // Combine with team members
  const allMembers = [
    ...formattedTeamMembers,
    ...squadMembers,
  ]

  // Remove duplicates
  const uniqueMembers = Array.from(
    new Map(allMembers.map((member) => [member.id, member])).values()
  ) as TeamMember[]

  return (
    <div className="space-y-6 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{formattedTeam?.name || "Team Profile"}</h1>
          <p className="text-muted-foreground">Team information and members</p>
        </div>
        {canEditStaff && (
          <Button asChild>
            <Link href={`/dashboard/team/staff-edit/${team.id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Staff Positions
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Card className="overflow-hidden bg-card border-border/40">
            <div className="h-48 w-full relative bg-gradient-to-r from-blue-600 to-blue-800">
              {formattedTeam?.banner_url ? (
                <Image src={formattedTeam.banner_url} alt="Team banner" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Building2 className="h-16 w-16 text-blue-300/50" />
                </div>
              )}
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="relative -mt-16 md:-mt-24">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={formattedTeam?.logo_url || ""} alt={formattedTeam?.name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {formattedTeam?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{formattedTeam?.name}</h2>
                  <p className="text-muted-foreground">{formattedTeam?.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="squads">Squads</TabsTrigger>
            </TabsList>
            <TabsContent value="members" className="mt-4">
              <Card className="bg-card border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members
                  </CardTitle>
                  <CardDescription>All members in your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uniqueMembers.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {uniqueMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border/40"
                          >
                            <Avatar>
                              <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                              {member.teamRole && (
                                <Badge variant="outline" className="mt-1">
                                  {member.teamRole}
                                </Badge>
                              )}
                              {member.squad && (
                                <p className="text-xs text-muted-foreground truncate mt-1">Squad: {member.squad}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No members found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="squads" className="mt-4">
              <Card className="bg-card border-border/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Squads
                  </CardTitle>
                  <CardDescription>Teams within your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {formattedSquads.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {formattedSquads.map((squad) => (
                          <div
                            key={squad.id}
                            className="p-4 rounded-lg border border-border/40"
                          >
                            <h3 className="font-medium">{squad.name}</h3>
                            <div className="mt-4 space-y-2">
                              <h4 className="text-sm font-medium">Members</h4>
                              <div className="space-y-2">
                                {squad.members.length > 0 ? (
                                  squad.members.map((member) => (
                                    <div
                                      key={member.user.id}
                                      className="flex items-center gap-2"
                                    >
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {member.user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">{member.user.name}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No members</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No squads found</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserSquare className="h-5 w-5" />
                Team Leadership
              </CardTitle>
              <CardDescription>Team president, vice-president, and coordinators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formattedTeam?.president && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {formattedTeam.president.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{formattedTeam.president.name}</p>
                      <p className="text-sm text-muted-foreground">President</p>
                    </div>
                  </div>
                )}

                {formattedTeam?.vice_president && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {formattedTeam.vice_president.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{formattedTeam.vice_president.name}</p>
                      <p className="text-sm text-muted-foreground">Vice President</p>
                    </div>
                  </div>
                )}

                {coordinators && coordinators.length > 0 && (
                  <>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">Coordinators</h4>
                    </div>
                    <div className="space-y-2">
                      {coordinators.map((coordinator) => (
                        <div key={coordinator.user.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {coordinator.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{coordinator.user.name}</p>
                            <p className="text-sm text-muted-foreground">Coordinator</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

