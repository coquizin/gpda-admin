import Link from "next/link"
import { canInviteUsers, getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"

export default async function UsersPage() {
  const supabase = createClient()

  const profile = await getUserProfile()
  const isLeader = await canInviteUsers()
  const isAdmin = profile?.is_admin || false

  if (!isLeader && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  // Get all users with their squad and team info
  const { data: users } = await supabase
  .from("profiles")
  .select(`
    *,
    user_squads!user_id (
      role,
      squad:squad_id (
        id,
        name,
        team:team_id (
          id,
          name
        )
      )
    ),
    user_teams!user_id (
      role,
      team:team_id (
        id,
        name
      )
    )
  `)
  .order("name");

  if (users) {
    // Sort users by name
    console.log(users, users[0]?.user_squads, users[0]?.user_teams)
  }

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6 w-full flex flex-col justify-center">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => {
                // Get the first squad if the user has multiple
                const userSquad = user.user_squads && user.user_squads.length > 0 ? {...user.user_squads[0].squad , role: user.user_teams[0].role} : null
                // Get the first team if the user has multiple
                const userTeam = user.user_teams && user.user_teams.length > 0 ? {...user.user_teams[0].team, role: user.user_teams[0].role} : null
                const role = userSquad?.role || userTeam?.role || "—"

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{role || "—"}</TableCell>
                    <TableCell>{userSquad?.name || "—"}</TableCell>
                    <TableCell>{userTeam?.name|| "—"}</TableCell>
                    <TableCell>{user.is_admin ? <Badge>Admin</Badge> : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/users/${user.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

