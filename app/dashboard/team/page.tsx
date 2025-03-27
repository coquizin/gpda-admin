import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getActiveTeam, isTeamStaff, getPresident, getVicePresident, getCoordinators } from "@/lib/auth"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2, Users, UserSquare, Edit, Shield, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Team, User, Squad } from "@/entities"
import { createClient } from "@/app/utils/supabase/client"
import { TeamEditModal } from "./team-edit-modal"
import { TeamFeed } from "./team-feed"

type TeamWithRelations = Team & {
  president: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'> | null
  vice_president: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'> | null
}

type SquadWithMembers = Squad & {
  members: Array<{
    user: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>
  }>
}

type TeamMember = Pick<User, 'id' | 'name' | 'email' | 'avatar_url' > & {
  teamRole?: string
  squad?: string | null
}

type UserTeamWithUser = {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar_url'>
  role: string
}

export default async function TeamProfilePage() {
  const supabase = createClient()
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
  const president = await getPresident(team.id) as User | null
  const vice_president = await getVicePresident(team.id) as User | null

  // Get team coordinators
  const coordinators = await getCoordinators(team.id) as User[] | null

  // Get team squads with members
  const { data: squads } = await supabase
    .from("squads")
    .select(`
      *,
      members:user_squads(
        user:profiles(
          id,
          name,
          email,
          avatar_url
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
        email,
        avatar_url
      ),
      role
    `)
    .eq("team_id", team.id) as { data: UserTeamWithUser[] | null }


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
    <div className="space-y-6 py-6 px-4 lg:px-6 max-w-6xl mx-auto">
      <Card className="overflow-hidden">
        <div className="h-48 w-full relative bg-gradient-to-r from-blue-600 to-blue-800">
          {team.banner_url ? (
            <Image src={team.banner_url || "/placeholder.svg"} alt="Team banner" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-16 w-16 text-blue-300/50" />
            </div>
          )}
        </div>
        <CardContent className="pt-6 flex justify-between">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative -mt-16 md:-mt-24">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={team.logo_url || ""} alt={team.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {team.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{team.name}</h2>
              <p className="text-muted-foreground">{team.description}</p>
            </div>
          </div>
          <div>
            {canEditStaff && (
              <TeamEditModal team={team} />
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5 space-y-6">
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="squads">Squads</TabsTrigger>
              <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Team Members
                    </CardTitle>
                    <Button size="sm" variant="outline" asChild>
                      <a href="/dashboard/invitations">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Member
                      </a>
                    </Button>
                  </div>
                  <CardDescription>All members in your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {uniqueMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || ""} alt={member.name} />
                          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.teamRole && (
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.teamRole.replace("_", " ")}
                              </Badge>
                            )}
                            {member.squad && (
                              <Badge variant="secondary" className="text-xs">
                                {member.squad}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="squads" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Squads
                    </CardTitle>
                    <Button size="sm" variant="outline" asChild>
                      <a href="/dashboard/squads">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Squad
                      </a>
                    </Button>
                  </div>
                  <CardDescription>Teams within your team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {squads?.map((squad) => (
                      <Card key={squad.id} className="border-border/40">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{squad.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <h4 className="text-sm font-medium mb-2">Members</h4>
                          <div className="space-y-2">
                            {squad.members.length > 0 ? (
                              squad.members.map((member) => (
                                <div key={member.user.id} className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={member.user.avatar_url || ""} alt={member.user.name} />
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feed" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Activity Feed
                  </CardTitle>
                  <CardDescription>Recent team activity and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamFeed teamId={team.id} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserSquare className="h-5 w-5" />
                Team Leadership
              </CardTitle>
              <CardDescription>Team president, vice-president, and coordinators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {president && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={president.avatar_url || ""} alt={president.name} />
                      <AvatarFallback>{president.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{president.name}</p>
                      <p className="text-sm text-muted-foreground">President</p>
                    </div>
                  </div>
                )}

                {vice_president && (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={vice_president.avatar_url || ""} alt={vice_president.name} />
                      <AvatarFallback>{vice_president.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{vice_president.name}</p>
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
                        <div key={coordinator.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={coordinator.avatar_url || ""} alt={coordinator.name} />
                            <AvatarFallback>{coordinator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{coordinator.name}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Team Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold">{uniqueMembers.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Squads</p>
                    <p className="text-2xl font-bold">{squads?.length}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm">{new Date(team.created_at).toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Activity</p>
                  <p className="text-sm">Today at 10:30 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

