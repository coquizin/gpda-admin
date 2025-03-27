import Link from "next/link"
import { canInviteUsers, getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import { Team, User, Squad } from "@/entities"
import { createClient } from "@/app/utils/supabase/client"

type TeamWithRelations = Team & {
  president: Pick<User, 'id' | 'name'> | null
  squads: Pick<Squad, 'id'>[]
}

export default async function TeamsPage() {
  const isLeader = await canInviteUsers()
    
  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get all teams with president info
  const { data: teams } = await supabase
    .from("teams")
    .select(`
      *,
      president:user_teams!inner(
        user:profiles(
          id,
          name
        )
      ),
      squads(
        id
      )
    `)
    .order("name")

  const formattedTeams = teams?.map(team => ({
    ...team,
    president: team.president?.[0]?.user || null,
    squads: team.squads || []
  })) as TeamWithRelations[] || []

  return (
    <div className="space-y-6 px-4 py-6 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage teams and their presidents</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>President</TableHead>
              <TableHead>Squads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formattedTeams.length > 0 ? (
              formattedTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.description}</TableCell>
                  <TableCell>{team.president?.name || "—"}</TableCell>
                  <TableCell>{team.squads.length}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/teams/${team.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No teams found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

