import { getActiveTeam, requireAuth } from "@/lib/auth"
import { SquadForm } from "../squad-form"

export default async function NewSquadPage() {
  await requireAuth()
  // Get all teams for dropdown
  const team = await getActiveTeam()
  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Squad</h1>
        <p className="text-muted-foreground">Create a new squad</p>
      </div>

      <SquadForm team={team || null} isEditing={false} />
    </div>
  )
}

