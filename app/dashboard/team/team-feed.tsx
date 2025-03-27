"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Heart, Share2, Calendar, UserPlus, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface FeedItem {
  id: string
  title: string
  content: string
  image_url?: string
  created_at: string
  type: "announcement" | "update" | "member_joined" | "squad_created"
  likes: number
  comments: number
  user: {
    id: string
    name: string
    avatar_url?: string
  }
}

// Mock feed data
const mockFeedItems: FeedItem[] = [
  {
    id: "1",
    title: "Team Announcement",
    content: "We are excited to announce that our team has been selected to lead the new product design initiative!",
    image_url: "/placeholder.svg?height=300&width=600",
    created_at: "2023-09-15T10:30:00Z",
    type: "announcement",
    likes: 24,
    comments: 5,
    user: {
      id: "user-1",
      name: "John Smith",
      avatar_url: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: "2",
    title: "New Member Joined",
    content:
      "Please welcome Jennifer Martinez to our team! Jennifer will be joining the UX Squad as a senior designer.",
    created_at: "2023-09-10T14:20:00Z",
    type: "member_joined",
    likes: 12,
    comments: 3,
    user: {
      id: "user-8",
      name: "Jennifer Martinez",
      avatar_url: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: "3",
    title: "Project Update",
    content:
      "The UI redesign project is now 75% complete. We expect to finish all deliverables by the end of next week.",
    image_url: "/placeholder.svg?height=300&width=600",
    created_at: "2023-09-05T09:15:00Z",
    type: "update",
    likes: 36,
    comments: 8,
    user: {
      id: "user-3",
      name: "Michael Brown",
      avatar_url: "/placeholder.svg?height=100&width=100",
    },
  },
  {
    id: "4",
    title: "New Squad Created",
    content: "We have created a new Brand Squad to focus on our brand identity and marketing materials.",
    created_at: "2023-08-28T11:45:00Z",
    type: "squad_created",
    likes: 18,
    comments: 2,
    user: {
      id: "user-2",
      name: "Sarah Johnson",
      avatar_url: "/placeholder.svg?height=100&width=100",
    },
  },
]

interface TeamFeedProps {
  teamId: string
}

export function TeamFeed({ teamId }: TeamFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data with a timeout
    const timer = setTimeout(() => {
      setFeedItems(mockFeedItems)
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [teamId])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return <Calendar className="h-4 w-4" />
      case "member_joined":
        return <UserPlus className="h-4 w-4" />
      case "squad_created":
        return <Shield className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-4 border-t">
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
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={item.user.avatar_url || ""} alt={item.user.name} />
                  <AvatarFallback>{item.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{item.user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted">
                {getTypeIcon(item.type)}
                <span>
                  {item.type === "announcement"
                    ? "Announcement"
                    : item.type === "member_joined"
                      ? "New Member"
                      : item.type === "squad_created"
                        ? "New Squad"
                        : "Update"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">{item.title}</h3>
              <p className="text-sm">{item.content}</p>

              {item.image_url && (
                <div className="relative h-64 w-full rounded-md overflow-hidden mt-3">
                  <Image src={item.image_url || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t p-4">
            <div className="flex gap-4 w-full">
              <Button variant="ghost" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span>{item.likes}</span>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{item.comments}</span>
              </Button>
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

