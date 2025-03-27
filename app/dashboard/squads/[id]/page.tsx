import { notFound, useParams } from "next/navigation"
import { canInviteUsers, getActiveTeam, requireAuth } from "@/lib/auth"
import { SquadForm } from "../squad-form"
import { createClient } from "@/app/utils/supabase/client"

export default async function SquadEditPage() {
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

  // Get squad data
  const { data: squad } = await supabase.from("squads").select("*").eq("id", id).single()

  if (!squad) {
    notFound()
  }

  // Get all teams for dropdown
  const team = await getActiveTeam()

  return (
    <div className="space-y-6 py-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Squad</h1>
        <p className="text-muted-foreground">Update squad information</p>
      </div>

      <SquadForm squad={squad} team={team} isEditing={true} />
    </div>
  )
}

