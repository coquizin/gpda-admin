import { notFound } from "next/navigation"
import { getActiveTeam, requireAuth } from "@/lib/auth"
import { SquadForm } from "../squad-form"
import { createClient } from "@/app/utils/supabase/client"

interface SquadEditPageProps {
  params: {
    id: string
  }
}

export default async function SquadEditPage({ params }: SquadEditPageProps) {
  const supabase = createClient()
  
  await requireAuth()
  const { id } = params

  // Get squad data
  const { data: squad } = await supabase.from("squads").select("*").eq("id", id).single()

  if (!squad) {
    notFound()
  }

  // Get all teams for dropdown
  const team = await getActiveTeam()

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Squad</h1>
        <p className="text-muted-foreground">Update squad information</p>
      </div>

      <SquadForm squad={squad} team={team} isEditing={true} />
    </div>
  )
}

