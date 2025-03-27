"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Camera, CheckCircle, ImageIcon, Pencil } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/lib/upload"
import { createClient } from "@/app/utils/supabase/client"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role?: string
  bio?: string
  website?: string
  x?: string
  instagram?: string
  avatar_url?: string
  banner_url?: string
}

interface ProfileEditModalProps {
  user: User
}

export function ProfileEditModal({ user }: ProfileEditModalProps) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [fullName, setFullName] = useState(user.name || "")
  const [bio, setBio] = useState(user.bio || "")
  const [website, setWebsite] = useState(user.website || "")
  const [twitter, setTwitter] = useState(user.x || "")
  const [instagram, setInstagram] = useState(user.instagram || "")

  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar_url || null)

  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | null>(user.banner_url || null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleBannerClick = () => {
    bannerInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      let imageAvatarUrl = avatarUrl
      let imageBannerUrl = user.banner_url
      if (avatarFile) {
        try {
          // Upload avatar image
          // setUploadingImage(true)
          imageAvatarUrl = await uploadImage(avatarFile, "bucket", "users")
          // setUploadingImage(false)
        } catch (error: any) {
          // setUploadingImage(false)
          setError("An error occurred while uploading avatar image")
          setLoading(false)
          imageAvatarUrl = ""
        }
      }

      if (bannerFile) {
        try {
          imageBannerUrl = await uploadImage(bannerFile, "bucket", "users")
        } catch (error: any) {
          setError("An error occurred while uploading banner image")
          setLoading(false)
          imageBannerUrl = ""
        }
      }

      const { error } = await supabase.from("profiles").update({
        name: fullName,
        bio,
        website,
        x: twitter,
        instagram,
        avatar_url: imageAvatarUrl,
        banner_url: imageBannerUrl,
      }).eq("id", user.id)

      if (error) throw error

      setSuccess("Profile updated successfully")
      setLoading(false)
      setOpen(false)
      router.refresh()

      
    } catch (error: any) {
      setError("An error occurred while updating profile")
      setLoading(false)
    }

    
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          <span>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[100dvh] overflow-hidden p-4 md:p-6 dialog-content-mobile">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
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

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="profile">Profile Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent
            value="profile"
            className="space-y-4 md:max-h-none max-h-[65dvh] overflow-y-auto pr-1 dialog-tabs-content"
          >
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="x">X</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    id="x"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                    @
                  </span>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="username"
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  To change your email, go to{" "}
                  <a href="/dashboard/settings" className="text-primary hover:underline">
                    account settings
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent
            value="media"
            className="space-y-6 max-h-[100dvh] md:max-h-none overflow-y-auto pr-1 dialog-tabs-content"
          >
            <div className="space-y-4">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="relative cursor-pointer" onClick={handleAvatarClick}>
                  <Avatar className="h-24 w-24 border-2 border-muted">
                    <AvatarImage src={avatarPreview || ""} alt={fullName} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm mb-2">Upload a new profile picture</p>
                  <Button type="button" variant="outline" size="sm" onClick={handleAvatarClick}>
                    Choose File
                  </Button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
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

        <DialogFooter className="sticky bottom-0 bg-background pt-2 border-t md:mt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="md:mb-0 mb-4" type="button" onClick={handleUpdateProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

