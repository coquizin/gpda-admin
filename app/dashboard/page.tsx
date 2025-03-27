import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

import data from "./data.json"
import { getActiveTeam, getUserProfile } from "@/lib/auth"
import { createClient } from "../utils/supabase/client"
import { title } from "process"
import { Users } from "lucide-react"

export default async function Page() {
  const supabase = createClient()
  const profile = await getUserProfile()
  const activeTeam = await getActiveTeam()
  const isAdmin = profile?.is_admin || false

  // team stats
  const {data: teamStats} = await supabase.rpc("get_team_stats")
  console.log("Team stats:", teamStats)
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

  const sectionCards = [
    {
      title: "Total Users",
      value: userCount,
      icon: Users,
      description: "Total users in the system",
    }, {
      title: "Total News",
      value: newsCount,
      icon: Users,
      description: "Total news in the system",
    }, {
      title: "Total Projects",
      value: projectsCount,
      icon: Users,
      description: "Total projects in the system",
    }, {
      title: "Total Squads",
      value: squadsCount,
      icon: Users,
      description: "Total squads in the system",
    }
  ]

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards data={sectionCards} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
  )
}
