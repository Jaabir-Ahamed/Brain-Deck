"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { ActivityItemComponent } from "@/components/activity-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabaseBrowser } from "@/lib/supabase"
import { toast } from "sonner"
import type { ActivityItem } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activity, setActivity] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Fetch recent activity (can be implemented later)
    setActivity([])
    setLoading(false)
  }, [])

  const handleStartStudying = async () => {
    try {
      const supabase = supabaseBrowser()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please sign in to study")
        router.push("/auth/signin")
        return
      }

      // Get last studied deck or latest deck
      const response = await fetch(`/api/decks/last-studied?userId=${user.id}`)
      
      if (!response.ok) {
        const error = await response.json()
        if (response.status === 404) {
          toast.error("No decks found. Create a deck or upload a PDF to get started.")
          router.push("/decks")
        } else {
          toast.error(error.error || "Failed to find deck")
        }
        return
      }

      const { deck } = await response.json()
      if (deck?.id) {
        router.push(`/study/${deck.id}`)
      } else {
        toast.error("No deck found")
        router.push("/decks")
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`)
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground mt-2">Here's your learning overview</p>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Ready to study?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a study session to review your cards
                </p>
              </div>
              <Button onClick={handleStartStudying}>
                Start Studying
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {activity.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activity.map((item) => (
                <ActivityItemComponent key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
