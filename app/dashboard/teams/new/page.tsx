import { canInviteUsers, requireAuth } from "@/lib/auth"
import { TeamForm } from "../team-form"
import { createClient } from "@/app/utils/supabase/client"

export default async function NewTeamPage() {
  const supabase = createClient()
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
  // Get all users for president dropdown
  const { data: users } = await supabase.from("profiles").select("id, name, email, is_admin").order("name")

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Team</h1>
        <p className="text-muted-foreground">Create a new team</p>
      </div>

      <TeamForm users={users || []} isEditing={false} />
    </div>
  )
}

