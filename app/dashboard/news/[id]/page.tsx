import { notFound } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { NewsForm } from "../news-form"
import { createClient } from "@/app/utils/supabase/server"

interface NewsEditPageProps {
  params: {
    id: string
  }
}

export default async function NewsEditPage({ params }: NewsEditPageProps) {
  await requireAuth()
  const { id } = params
  const supabase = await createClient()
  // Get news data
  const { data: news } = await supabase.from("news").select("*").eq("id", id).single()

  if (!news) {
    notFound()
  }

  // Get all teams for dropdown
  const { data: teams } = await supabase.from("teams").select("id, name").order("name")

  return (
    <div className="space-y-6 px-4 lg:px-6 py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit News</h1>
        <p className="text-muted-foreground">Update news article</p>
      </div>

      <NewsForm news={news} teams={teams || []} isEditing={true} />
    </div>
  )
}

