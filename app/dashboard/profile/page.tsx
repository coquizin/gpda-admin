import { getUserProfile, requireAuth, getActiveTeam, getUserNews, getUserProjects } from "@/lib/auth"
import { ProfileEditModal } from "./profile-edit-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, LucideLink, Mail, AtSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import NextLink from "next/link"
import { UserFeed } from "./user-feed"
import { Badge } from "@/components/ui/badge"

export default async function ProfilePage() {
  await requireAuth()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  const userNews = await getUserNews()
  const userProjects = await getUserProjects()
  
  if (!profile) {
    return null
  }

  const bannerUrl = profile?.banner_url || activeTeam?.banner_url || null

  let userFeedItems:any = []

  userNews?.forEach((news) => {
    userFeedItems.push({
      id: news.id,
      title: news.title,
      content: news.content,
      image_url: news.image_url,
      created_at: news.created_at,
      type: "post",
      team_id: news.team_id,
      team_logo_url: news.team.logo_url,
      team_name: news.team.name,
    })
  })

  userProjects?.forEach((project) => {
    userFeedItems.push({
      id: project.id,
      title: project.name,
      content: project.description,
      image_url: project.image_url,
      created_at: project.created_at,
      type: "project",
      team_id: project.team_id,
      team_logo_url: project.team.logo_url,
      team_name: project.team.name,
    })
  })

  userFeedItems = userFeedItems.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
      {/* Profile Header with Banner */}
      <div className="relative w-full max-w-3xl mx-auto rounded-xl mb-16">
        {/* Team Banner */}
        <div className="h-48 w-full relative bg-gradient-to-r from-gray-800 to-gray-600">
          {bannerUrl ? (
            <Image
              src={bannerUrl || "/placeholder.svg"}
              alt="Team banner"
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-300/50 text-lg font-medium">Team Banner</div>
            </div>
          )}
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute -bottom-12 left-6 flex items-end z-50">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.name} />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                {profile.name?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Settings Button */}
        <div className="absolute top-4 right-4">
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <NextLink href="/dashboard/settings">
              <span>Settings</span>
            </NextLink>
          </Button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-16 max-w-3xl mx-auto">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="flex md:flex-row flex-col md:items-center items-start gap-4">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  {profile?.is_admin && <Badge>Admin</Badge>}
                </div>
                <p className="text-muted-foreground">{profile.role || "Member"}</p>
              </div>
              <ProfileEditModal user={profile} />
            </div>

            <div className="space-y-6">
              {/* Bio Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Bio</h3>
                <p>{profile.bio || "No bio :("}</p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">Contact & Links</h3>
                <div className="grid gap-2">
                  {profile.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{profile.email}</span>
                    </div>
                  )}

                  {profile.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <LucideLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {profile.twitter && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.twitter}
                      </a>
                    </div>
                  )}

                  {profile.instagram && (
                    <div className="flex items-center gap-2 text-sm">
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://instagram.com/${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Feed Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <UserFeed feedData={userFeedItems}  />
        </div>
      </div>
    </div>
  )
}

