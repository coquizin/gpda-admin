"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getInitials } from "@/app/utils/utils"

interface FeedItem {
  id: string
  title: string
  content: string
  image_url?: string
  created_at: string
  type: "project" | "post" | "update"
  taem_id: string
  team_logo_url: string
  team_name: string
}

interface FeedProps {
  feedData: FeedItem[]
}

// Mock feed data

export function UserFeed({ feedData }: FeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    // Simulate loading data with a timeout
    const timer = setTimeout(() => {
      setFeedItems(feedData)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [feedData])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (feedItems.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No activity to show yet.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item?.team_logo_url} alt="User" />
                  <AvatarFallback>{getInitials(item?.team_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="px-2 py-1 text-xs rounded-full bg-muted">
                {item.type === "project" ? "Project" : item.type === "post" ? "Post" : "Update"}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <p className="whitespace-pre-line">
              {expandedItems[item.id]
                ? item.content
                : item.content.length > 200
                ? `${item.content.slice(0, 200)}...`
                : item.content}
            </p>

            {item.content.length > 200 && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-sm text-blue-500 hover:underline mt-1"
              >
                {expandedItems[item.id] ? "See less" : "See more"}
              </button>
            )}

            {item.image_url && (
              <div className="relative h-64 w-full rounded-md overflow-hidden">
                <Image src={item.image_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
              </div>
            )}
          </CardContent>

          <CardFooter className=" pt-3">
            <div className="flex gap-4 w-full">
              {/* <Button variant="ghost" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span>{item.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{item.comments}</span>
              </Button> */}
              <Button variant="ghost" size="sm" className="gap-1 ml-auto">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

