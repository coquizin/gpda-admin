import Link from "next/link"
import { getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"

export default async function ProjectsPage() {
  const supabase = createClient()
  const profile = await getUserProfile()

  // Get user's team ID if they belong to a squad
  let teamIds: string[] = []

  if (profile?.is_admin) {
    // Admins can see all projects
    const { data: teams } = await supabase.from("teams").select("id")

    teamIds = teams?.map((team) => team.id) || []
  } else if (profile?.squad_id) {
    // Get the team ID for the user's squad
    const { data: squad } = await supabase.from("squads").select("team_id").eq("id", profile.squad_id).single()

    if (squad) {
      teamIds = [squad.team_id]
    }
  }

  // Get projects for the user's team(s)
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      team:team_id (
        name
      )
    `)
    .in("team_id", teamIds)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage team projects</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.team?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        project.status === "Completed"
                          ? "default"
                          : project.status === "In Progress"
                            ? "secondary"
                            : project.status === "Planned"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

