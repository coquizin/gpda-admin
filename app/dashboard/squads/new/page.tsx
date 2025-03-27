import { canInviteUsers, getActiveTeam, requireAuth } from "@/lib/auth"
import { SquadForm } from "../squad-form"

export default async function NewSquadPage() {
  await requireAuth()
  const isLeader = await canInviteUsers()
    
  if (!isLeader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    )
  }
  // Get all teams for dropdown
  const team = await getActiveTeam()
  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Squad</h1>
        <p className="text-muted-foreground">Create a new squad</p>
      </div>

      <SquadForm team={team || null} isEditing={false} />
    </div>
  )
}

