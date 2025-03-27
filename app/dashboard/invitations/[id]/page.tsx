import { notFound } from "next/navigation"
import { getUserProfile, canInviteUsers } from "@/lib/auth"
import { getInvitation } from "@/lib/invitations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Copy, Mail } from "lucide-react"


export default async function InvitationViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getUserProfile()
  const canInvite = await canInviteUsers()

  if (!canInvite || !profile) {
    notFound()
  }

  try {
    const invitation = await getInvitation(id)

    if (!invitation || invitation.created_by !== profile.id) {
      notFound()
    }

    const isExpired = new Date(invitation.expires_at) < new Date()
    const status = invitation.used ? "Used" : isExpired ? "Expired" : "Pending"

    const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/register?invitation=${invitation.id}`

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/invitations">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invitation Details</h1>
            <p className="text-muted-foreground">View invitation information</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invitation for {invitation.email}</CardTitle>
              <Badge variant={status === "Used" ? "default" : status === "Expired" ? "destructive" : "secondary"}>
                {status}
              </Badge>
            </div>
            <CardDescription>Created on {new Date(invitation.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
                <p>{invitation.role}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Team</h3>
                <p>{invitation.team?.name || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Squad</h3>
                <p>{invitation.squad?.name || "—"}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expires</h3>
                <p>{new Date(invitation.expires_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Created By</h3>
                <p>{invitation.creator?.full_name || "—"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Invitation Link</h3>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <code className="text-sm flex-1 break-all">{invitationLink}</code>
                <Button variant="ghost" size="icon" className="copy-button" data-clipboard-text={invitationLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild>
                <Link
                  href={`mailto:${invitation.email}?subject=Team Invitation&body=You've been invited to join ${invitation.team?.name}. Click the following link to register: ${invitationLink}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/invitations">Back</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

