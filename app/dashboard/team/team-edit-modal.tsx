"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Camera, CheckCircle, Edit, ImageIcon } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"
import { uploadImage } from "@/lib/upload"

interface Team {
  id: string
  name: string
  description?: string
  logo_url?: string
  banner_url?: string
  president?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  vice_president?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

interface TeamEditModalProps {
  team: Team
}

export function TeamEditModal({ team }: TeamEditModalProps) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState(team.name || "")
  const [description, setDescription] = useState(team.description || "")

  const [logoUrl, setLogoUrl] = useState(team.logo_url || "")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(team.logo_url || null)

  const [bannerUrl, setBannerUrl] = useState(team.banner_url || "")
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(team.banner_url || null)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleLogoClick = () => {
    logoInputRef.current?.click()
  }

  const handleBannerClick = () => {
    bannerInputRef.current?.click()
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLogoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBannerFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBannerPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpdateTeam = async (e: React.FormEvent) => {
   e.preventDefault()
       setLoading(true)
       setError(null)
       setSuccess(null)
   
       try {
         let imageLogoUrl = logoUrl
         let imageBannerUrl = team.banner_url
         if (logoFile) {
           try {
             // Upload avatar image
             // setUploadingImage(true)
             imageLogoUrl = await uploadImage(logoFile, "bucket", "teams")
             // setUploadingImage(false)
           } catch (error: any) {
             // setUploadingImage(false)
             setError("An error occurred while uploading logo image")
             setLoading(false)
             imageLogoUrl = ""
           }
         }
   
         if (bannerFile) {
           try {
             imageBannerUrl = await uploadImage(bannerFile, "bucket", "teams")
           } catch (error: any) {
             setError("An error occurred while uploading banner image")
             setLoading(false)
             imageBannerUrl = ""
           }
         }
   
         const { error } = await supabase.from("teams").update({
              name,
              description,
              logo_url: imageLogoUrl,
              banner_url: imageBannerUrl,
            }).match({ id: team.id })
   
         if (error) throw error
   
         setSuccess("Team updated successfully")
         setLoading(false)
         setOpen(false)
         router.refresh()
   
         
       } catch (error: any) {
         setError("An error occurred while updating Team")
         setLoading(false)
       }
   
       
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Team</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="info">Team Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your team's purpose and goals"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="space-y-4">
              <Label>Team Logo</Label>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={handleLogoClick}>
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={logoPreview || ""} alt={name} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">Upload a new team logo</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleLogoClick}>
                    Choose File
                  </Button>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Banner Image</Label>
              <div
                className="relative h-32 w-full bg-muted rounded-md overflow-hidden cursor-pointer"
                onClick={handleBannerClick}
              >
                {bannerPreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={bannerPreview || "/placeholder.svg"}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex justify-start">
                <Button type="button" variant="outline" size="sm" onClick={handleBannerClick}>
                  Choose Banner Image
                </Button>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpdateTeam} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

