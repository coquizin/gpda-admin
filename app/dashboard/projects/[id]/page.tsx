import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { ProjectForm } from "../project-form"
import { createClient } from "@/app/utils/supabase/client"

interface ProjectEditPageProps {
  params: {
    id: string
  }
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const supabase = createClient()
  await requireAuth()
  const { id } = params

  // Get project data
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single()

  if (!project) {
    notFound()
  }

  // Get all teams for dropdown
  const { data: teams } = await supabase.from("teams").select("id, name").order("name")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
        <p className="text-muted-foreground">Update project details</p>
      </div>

      <ProjectForm project={project} teams={teams || []} isEditing={true} />
    </div>
  )
}

