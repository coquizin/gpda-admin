import Link from "next/link"
import { getUserProfile, canInviteUsers } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/app/utils/supabase/client"

export default async function InvitationsPage() {
  const supabase = createClient()
  const profile = await getUserProfile()
  const canInvite = await canInviteUsers()

  if (!canInvite) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }

  // Get invitations created by the current user
  const { data: invitations } = await supabase
    .from("invitations")
    .select(`
      *,
      team:team_id (
        name
      ),
      squad:squad_id (
        name
      )
    `)
    .eq("created_by", profile?.id || "")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
          <p className="text-muted-foreground">Manage team invitations</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invitations/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invitation
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations && invitations.length > 0 ? (
              invitations.map((invitation) => {
                const isExpired = new Date(invitation.expires_at) < new Date()
                const status = invitation.used ? "Used" : isExpired ? "Expired" : "Pending"

                return (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{invitation.role}</TableCell>
                    <TableCell>{invitation.team?.name || "—"}</TableCell>
                    <TableCell>{invitation.squad?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={status === "Used" ? "default" : status === "Expired" ? "destructive" : "secondary"}
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invitation.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/invitations/${invitation.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No invitations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

