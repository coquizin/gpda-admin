import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SectionCardsProps {
  data: {
    title: string
    value?: number | null
    icon: LucideIcon
    description: string
  }[]
}

export function SectionCards({ data }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:shadow-xs lg:grid-cols-2 xl:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {data.map((item) => (
        <Card key={item.title} className="@container/card">
          <CardHeader className="relative">
            <CardDescription>{item.title}</CardDescription>
            <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
              {item.value || 0}
            </CardTitle>
            <div className="absolute right-4 top-4">
              <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                <TrendingUpIcon className="size-3" />
                +12.5%
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUpIcon className="size-4" />
            </div>
            <div className="text-muted-foreground">
              {item.description}
            </div>
          </CardFooter>
        </Card>
      ))}

    </div>
  )
}
