import { createClient } from "@/app/utils/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Default bucket name - make sure this exists in your Supabase project
const DEFAULT_BUCKET = "public"

export async function getAllBuckets() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.storage.listBuckets()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error getting buckets:", error)
    throw error
  }
}

export async function uploadImage(file: File, bucket: string = DEFAULT_BUCKET, folder: string) {
  try {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${uuidv4()}.${fileExt}`

    // First check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error checking buckets:", bucketsError)
      throw bucketsError
    }

    // If the specified bucket doesn't exist, use the default bucket
    const bucketExists = buckets.some((b) => b.name === bucket)
    const bucketToUse = bucketExists ? bucket : DEFAULT_BUCKET

    // Upload the file
    const { data, error } = await supabase.storage.from(bucketToUse).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    const { data: urlData } = supabase.storage.from(bucketToUse).getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function deleteImage(url: string, bucket: string = DEFAULT_BUCKET) {
  try {
    const supabase = createClient()
    // Extract the path from the URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(new RegExp(`/${bucket}/object/public/(.+)$`))

    if (!pathMatch || !pathMatch[1]) {
      throw new Error("Invalid image URL format")
    }

    const path = pathMatch[1]

    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

