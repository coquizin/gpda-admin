import { getUserProfile } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart } from "@/components/area-chart"
import { Users, Newspaper, FolderKanban, Layers } from "lucide-react"
import { createClient } from "../utils/supabase/client"

export default async function DashboardPage() {
  const supabase = createClient()
  const profile = await getUserProfile()
  const isAdmin = profile?.is_admin || false
  
  // Get team stats
  const { data: teamStats } = await supabase.rpc("get_team_stats")

  // Get user count
  const { count: userCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Get news count
  const { count: newsCount } = await supabase.from("news").select("*", { count: "exact", head: true })

  // Get projects count
  const { count: projectsCount } = await supabase.from("projects").select("*", { count: "exact", head: true })

  // Get squads count
  const { count: squadsCount } = await supabase.from("squads").select("*", { count: "exact", head: true })

  // Get recent news
  const { data: recentNews } = await supabase
    .from("news")
    .select(`
      *,
      author:author_id (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  console.log("Dashboard data:", { userCount, newsCount, projectsCount, squadsCount, recentNews })

  return (
    <div className="space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active members in the organization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Published news and announcements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Projects currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Squads</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{squadsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Working groups across teams</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <AreaChart data={[]} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent News</CardTitle>
            <CardDescription>Latest announcements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentNews && recentNews.length > 0 ? (
                recentNews.map((news) => (
                  <div className="flex items-center" key={news.id}>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{news.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By {news.author?.name || "Unknown"} on {new Date(news.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent news</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

