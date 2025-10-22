"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus } from "lucide-react"

const curatedItems = [
  {
    id: 1,
    title: "The Future of AI in 2025",
    source: "TechCrunch",
    url: "https://techcrunch.com/...",
    likes: 234,
    liked: false,
    category: "AI",
  },
  {
    id: 2,
    title: "React 19 Released with New Features",
    source: "React Blog",
    url: "https://react.dev/...",
    likes: 567,
    liked: true,
    category: "Web Dev",
  },
  {
    id: 3,
    title: "Design Systems at Scale",
    source: "Design Observer",
    url: "https://designobserver.com/...",
    likes: 123,
    liked: false,
    category: "Design",
  },
  {
    id: 4,
    title: "Creator Economy Trends Q1 2025",
    source: "Creator Insider",
    url: "https://creatorinsider.com/...",
    likes: 456,
    liked: false,
    category: "Business",
  },
]

export function CuratedItems() {
  const [items, setItems] = useState(curatedItems)

  const toggleLike = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, liked: !item.liked, likes: item.liked ? item.likes - 1 : item.likes + 1 } : item,
      ),
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-3 p-4 overflow-y-auto">
        {items.map((item) => (
          <Card key={item.id} className="border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleLike(item.id)}
                    className={item.liked ? "text-red-500" : "text-muted-foreground"}
                  >
                    <Heart className={`h-4 w-4 ${item.liked ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <h4 className="font-medium text-foreground text-sm line-clamp-2 hover:text-primary cursor-pointer">
                  {item.title}
                </h4>

                <p className="text-xs text-muted-foreground">{item.source}</p>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {item.likes}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trends Section */}
      <div className="border-t border-border bg-card/50 p-4">
        <h4 className="font-semibold text-foreground text-sm mb-3">Trending Topics</h4>
        <div className="space-y-2">
          {["#AI", "#WebDev", "#Design", "#Startups"].map((trend) => (
            <Button key={trend} variant="outline" size="sm" className="w-full justify-start text-xs bg-transparent">
              {trend}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
