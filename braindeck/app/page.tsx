"use client"

import { AppShell } from "@/components/app-shell"
import { ActivityItemComponent } from "@/components/activity-item"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { mockActivity } from "@/lib/mock-data"
import { toast } from "sonner"

export default function HomePage() {
  const handleStartStudying = () => {
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
