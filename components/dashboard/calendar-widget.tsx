"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDrafts } from "@/lib/hooks/use-drafts"
import { format } from "date-fns"

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { drafts } = useDrafts(50) // Fetch more drafts for calendar view

  // Calculate scheduled events by date
  const eventsByDate: Record<string, { count: number; label: string }> = {}

  drafts.forEach((draft) => {
    if (draft.scheduled_at) {
      const dateKey = format(new Date(draft.scheduled_at), 'yyyy-MM-dd')
      if (eventsByDate[dateKey]) {
        eventsByDate[dateKey].count++
        eventsByDate[dateKey].label = `${eventsByDate[dateKey].count} scheduled`
      } else {
        eventsByDate[dateKey] = { count: 1, label: '1 scheduled' }
      }
    }
  })

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Publishing Calendar</CardTitle>
            <CardDescription>Your scheduled newsletters</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-center text-sm font-medium text-foreground">{monthName}</p>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const dateStr = format(
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
                'yyyy-MM-dd'
              )
              const event = eventsByDate[dateStr]
              const isToday =
                new Date().toDateString() ===
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

              return (
                <div
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                    event
                      ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      : isToday
                      ? "border-primary/50 bg-primary/5 text-foreground hover:border-primary/30"
                      : "border-border/50 text-muted-foreground hover:border-primary/30"
                  }`}
                  title={event?.label}
                >
                  {day}
                </div>
              )
            })}
          </div>

          {Object.keys(eventsByDate).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No scheduled newsletters yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
