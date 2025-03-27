import Link from "next/link"
import { getActiveTeam, getUserProfile } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EllipsisVertical, PlusCircle } from "lucide-react"
import { createClient } from "@/app/utils/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DeleteNewsDialog } from "@/components/news/delete-news-dialog"

export default async function NewsPage() {
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

  // Get news for the user's team(s)
  const { data: news, error } = await supabase
  .from("news")
  .select(`
    *,
    team:team_id (
      id,
      name
    ),
    author:author_id (
      id,
      name,
      avatar_url
    )
  `)
  .in("team_id", teamIds)
  .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
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
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news && news.length > 0 ? (
              news.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img src={item.image_url} alt={item.title} className="h-12 w-12 object-cover rounded-lg" />
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.team?.name || "—"}</TableCell>
                  <TableCell className="capitalize">{item.author?.name || "—"}</TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
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
                            <a href={`/dashboard/news/${item.id}`}>
                              Edit
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DeleteNewsDialog news={item} />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

