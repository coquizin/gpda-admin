import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { TeamForm } from "../team-form"
import { createClient } from "@/app/utils/supabase/client"

interface TeamEditPageProps {
  params: {
    id: string
  }
}

export default async function TeamEditPage({ params }: TeamEditPageProps) {
  const supabase = createClient()
  await requireAuth()
  const { id } = params

  // Get team data
  const { data: team } = await supabase.from("teams").select("*").eq("id", id).single()

  if (!team) {
    notFound()
  }

  // Get all users for president dropdown
  const { data: users } = await supabase.from("profiles").select("id, name, email, is_admin").order("name")
  console.log(users)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Team</h1>
        <p className="text-muted-foreground">Update team information</p>
      </div>

      <TeamForm team={team} users={users || []} isEditing={true} />
    </div>
  )
}

