import { getUserProfile, requireAuth } from "@/lib/auth"
import { UserProfileForm } from "./user-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle } from "lucide-react"

export default async function ProfilePage() {
  await requireAuth()
  const profile = await getUserProfile()

  if (!profile) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <UserCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:inline-flex">
          <TabsTrigger value="profile">Personal Info</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information and password</CardDescription>
            </CardHeader>
            <CardContent>
              <UserProfileForm user={profile} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your theme and language preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <PreferencesForm />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PreferencesForm() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Theme & Language</h3>
        <p className="text-sm text-muted-foreground">
          These settings are managed through the sidebar and saved automatically.
        </p>
      </div>
    </div>
  )
}

