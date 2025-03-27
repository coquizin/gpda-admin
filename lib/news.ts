import { createClient } from "@/app/utils/supabase/client"

export default async function deleteNews(newsId: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("news").delete().match({ id: newsId })
    return { data, error }
}