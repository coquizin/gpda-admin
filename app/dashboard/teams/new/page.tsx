import { requireAuth } from "@/lib/auth"
import { TeamForm } from "../team-form"
import { createClient } from "@/app/utils/supabase/client"

export default async function NewTeamPage() {
  const supabase = createClient()
  await requireAuth()

  // Get all users for president dropdown
  const { data: users } = await supabase.from("profiles").select("id, name, email, is_admin").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Team</h1>
        <p className="text-muted-foreground">Create a new team</p>
      </div>

      <TeamForm users={users || []} isEditing={false} />
    </div>
  )
}

