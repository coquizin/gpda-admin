import Link from "next/link"
import { canInviteUsers, getActiveTeam, getUserProfile, getUserTeams } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"
import React from "react"

export default async function SquadsPage() {
  const isLeader = await canInviteUsers()
  
  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  const profile = await getUserProfile()
  const supabase = createClient()
  const userTeams = await getUserTeams()
  const activeTeam = await getActiveTeam()
  const selectedTeam = userTeams.find((team) => team.id === activeTeam?.id) || null
  const isAdmin = profile?.is_admin || false

  if (selectedTeam === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Select a team</h1>
        <p className="text-muted-foreground">Please select a team to view squads.</p>
      </div>
    )
  }

  let squadQuery = supabase
  .from("squads")
  .select(`
    *,
    teams:team_id (
      name
    ),
    users:user_squads (
      user_id
    )
  `)
  .order("name");

  if (!isAdmin) {
    squadQuery = squadQuery.in("team_id", [selectedTeam?.id]);
  }

  const { data: squads, error: squadError } = await squadQuery;
  
  if (squadError) {
    console.error("Error fetching squads:", squadError)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Error</h1>
        <p className="text-muted-foreground">Failed to load squads.</p>
      </div>
    )
  }
  if (!squads) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
    )
  }
  if (squads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">No squads found</h1>
        <p className="text-muted-foreground">You do not have any squads assigned.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Squads</h1>
          <p className="text-muted-foreground">Manage squads and their team assignments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/squads/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Squad
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {squads && squads.length > 0 ? (
              squads.map((squad) => (
                <TableRow key={squad.id}>
                  <TableCell className="font-medium">{squad.name}</TableCell>
                  <TableCell>{squad.teams?.name || "—"}</TableCell>
                  <TableCell>{squad.users?.length || 0}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/squads/${squad.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No squads found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

