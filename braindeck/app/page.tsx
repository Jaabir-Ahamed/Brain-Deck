"use client"

import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { ActivityItemComponent } from "@/components/activity-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockActivity } from "@/lib/mock-data"
import { Zap, BookOpen, Lightbulb, Flame } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const { decks, cards } = useAppStore()

  const dueToday = decks.reduce((sum, deck) => sum + deck.dueToday, 0)
  const totalCards = cards.length
  const newSuggestions = 6
  const streak = 7

  const handleStartStudying = () => {
    if (dueToday === 0) {
      toast.info("No cards due today. Great job!")
      return
    }
    toast.success("Starting study session (mock)")
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">Here's your learning overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Zap} label="Due Today" value={dueToday} description="cards to review" />
          <StatCard icon={BookOpen} label="Total Cards" value={totalCards} description="in your decks" />
          <StatCard icon={Lightbulb} label="New Suggestions" value={newSuggestions} description="waiting to review" />
          <StatCard icon={Flame} label="Streak" value={streak} description="days in a row" />
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Ready to study?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You have {dueToday} cards due today. Keep your streak going!
                </p>
              </div>
              <Button onClick={handleStartStudying} disabled={dueToday === 0}>
                Start Studying
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {mockActivity.map((item) => (
              <ActivityItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
