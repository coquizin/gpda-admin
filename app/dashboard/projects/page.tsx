import Link from "next/link"
import { getActiveTeam, getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { EllipsisVertical, PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"

export default async function ProjectsPage() {
   const supabase = createClient()
   const profile = await getUserProfile()
   const activeTeam = await getActiveTeam()
 
   // Get user's team ID if they belong to a squad
   let teamIds: string[] = []
 
   if (profile?.is_admin) {
     // Admins can see all news
     const { data: teams } = await supabase.from("teams").select("id")
     teamIds = teams?.map((team) => team.id) || []
   } else {
     if (activeTeam) {
       teamIds = [activeTeam.id]
     }
   }
 
   // Get projects for the user's team(s)
   const { data: projects, error } = await supabase
   .from("projects")
   .select(`
     *,
     team:team_id (
       id,
       name
     ),
     squad:squad_id (
       id,
       name
     )
   `)
   .in("team_id", teamIds)
   .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
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
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Squad</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <img src={project.image_url} alt={project.title} className="h-12 w-12 object-cover rounded-lg" />
                  </TableCell>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.team?.name || "—"}</TableCell>
                  <TableCell>{project.squad?.name || "—"}</TableCell>
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
                  <TableCell>
                    <div className="flex justify-end items-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <EllipsisVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem asChild>
                            <a href={`/dashboard/projects/${project.id}`}>
                              Edit
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteProjectDialog project={project} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

