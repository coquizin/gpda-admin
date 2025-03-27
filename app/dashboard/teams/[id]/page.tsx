import { notFound, useParams } from "next/navigation"
import { canInviteUsers, requireAuth } from "@/lib/auth"
import { TeamForm } from "../team-form"
import { createClient } from "@/app/utils/supabase/client"

export default async function TeamEditPage() {
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

  const { id } = useParams<{ id: string}>()

  // Get team data
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    notFound()
  }

  // Get all users for president dropdown
  const { data: users } = await supabase.from("profiles").select("id, name, email, is_admin").order("name")
  console.log(users)

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
        <p className="text-muted-foreground">Update team information</p>
      </div>

      <TeamForm team={team} users={users || []} isEditing={true} />
    </div>
  )
}

