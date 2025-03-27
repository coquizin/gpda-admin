"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Project } from "@/entities"
import deleteProject from "@/lib/projetcs"

export function DeleteProjectDialog({ project }: {project: Project}) {
  const [open, setOpen] = useState(false)
  const [confirmName, setConfirmName] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmName !== project.name) return

    setIsDeleting(true)

    try {
        
        const { data, error } = await deleteProject(project.id)

        if (error) {
            throw new Error(error.message)
        }

        toast({
            title: "Project deleted",
            description: `${project.name} has been deleted successfully.`,
        })

        setOpen(false)
        router.refresh()
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete the project. Please try again.",
            variant: "destructive",
        })
    } finally {
        setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenuItem
        variant="destructive"
        onClick={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
        className="text-red-600 hover:text-red-50 hover:bg-red-600 focus:bg-red-600 focus:text-red-50"
      >
        Delete
      </DropdownMenuItem>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">
                To confirm, type <span className="font-semibold">{project.name}</span> below
              </Label>
              <Input
                id="project-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={project.name}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== project.name || isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

