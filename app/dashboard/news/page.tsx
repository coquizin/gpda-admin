import Link from "next/link"
import { getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/server"

export default async function NewsPage() {
  const supabase = await createClient()
  const profile = await getUserProfile()

  // Get user's team ID if they belong to a squad
  let teamIds: string[] = []

  if (profile?.is_admin) {
    // Admins can see all news
    const { data: teams } = await supabase.from("teams").select("id")

    teamIds = teams?.map((team) => team.id) || []
  } else if (profile?.squad_id) {
    // Get the team ID for the user's squad
    const { data: squad } = await supabase.from("squads").select("team_id").eq("id", profile.squad_id).single()

    if (squad) {
      teamIds = [squad.team_id]
    }
  }

  // Get news for the user's team(s)
  const { data: news } = await supabase
    .from("news")
    .select(`
      *,
      author:author_id (
        full_name
      ),
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
          <h1 className="text-3xl font-bold tracking-tight">News</h1>
          <p className="text-muted-foreground">Latest news and announcements</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/news/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add News
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news && news.length > 0 ? (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.team?.name || "—"}</TableCell>
                  <TableCell>{item.author?.full_name || "—"}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/news/${item.id}`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No news found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

