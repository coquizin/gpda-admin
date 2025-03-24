"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { uploadImage } from "@/lib/upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Upload, X, ImageIcon } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/app/utils/supabase/client"

interface Team {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  description: string
  team_id: string
  status: string
  image_url: string | null
}

interface ProjectFormProps {
  project?: Project
  teams: Team[]
  isEditing: boolean
}

export function ProjectForm({ project, teams, isEditing }: ProjectFormProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [teamId, setTeamId] = useState(project?.team_id || (teams.length === 1 ? teams[0].id : ""))
  const [status, setStatus] = useState(project?.status || "Planned")
  const [imageUrl, setImageUrl] = useState(project?.image_url || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(project?.image_url || null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const statusOptions = ["Planned", "In Progress", "Completed", "On Hold", "Cancelled"]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setUploadError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl("")
    setUploadError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUploadError(null)

    try {
      // Upload image if selected
      let finalImageUrl = imageUrl
      if (imageFile) {
        try {
          setUploadingImage(true)
          finalImageUrl = await uploadImage(imageFile, "public", "projects")
          setUploadingImage(false)
        } catch (uploadErr: any) {
          setUploadingImage(false)
          setUploadError(`Image upload failed: ${uploadErr.message || "Unknown error"}`)
          // Continue with the form submission without the image
          finalImageUrl = ""
        }
      }

      if (isEditing) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
          .update({
            name,
            description,
            team_id: teamId,
            status,
            image_url: finalImageUrl || null,
          })
          .eq("id", project!.id)

        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase.from("projects").insert({
          name,
          description,
          team_id: teamId,
          status,
          image_url: finalImageUrl || null,
        })

        if (error) throw error
      }

      router.push("/dashboard/projects")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border/40">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Project Image</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("image-upload")?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {imagePreview ? "Change Image" : "Upload Image"}
                </Button>
                {imagePreview && (
                  <Button type="button" variant="outline" onClick={handleRemoveImage} className="text-destructive">
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </div>

              {uploadError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {imagePreview && (
                <div className="mt-4 relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border/40">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              )}

              {!imagePreview && (
                <div className="mt-4 flex items-center justify-center aspect-video w-full max-w-md border border-dashed border-border/40 rounded-lg bg-muted/20">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm">No image selected</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select value={teamId} onValueChange={setTeamId} required disabled={teams.length === 1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || uploadingImage}>
              {loading || uploadingImage ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/projects")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

