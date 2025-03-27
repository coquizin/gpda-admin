import { createClient } from "@/app/utils/supabase/client"


export default async function deleteProject(projectId: string) {
    const supabase = createClient()
    const { data, error } = await supabase.from("projects").delete().match({ id: projectId })
    return { data, error }
}