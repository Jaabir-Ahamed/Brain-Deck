"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Key, Zap } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState("John Doe")
  const [email] = useState("john@example.com")
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [uploadsRemaining] = useState(5)
  const [suggestionsRemaining] = useState(42)

  const handleSaveName = () => {
    toast.success("Profile updated (mock)")
  }

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key")
      return
    }
    toast.success("API key saved (mock)")
    setApiKey("")
  }

  const handleSignOut = () => {
    toast.success("Signed out (mock)")
    router.push("/auth/signin")
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Display Name</label>
              <div className="flex gap-2">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <Button onClick={handleSaveName}>Save</Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <div className="flex items-center gap-2">
                <Input value={email} disabled className="bg-muted" />
                <Badge variant="secondary">Read-only</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Contact support to change your email</p>
            </div>
          </CardContent>
        </Card>

        {/* API Key Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              OpenRouter API Key
            </CardTitle>
            <CardDescription>Optional: Add your OpenRouter key for advanced features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">API Key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-or-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)} className="px-3">
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Your key is stored locally only</p>
            </div>
            <Button onClick={handleSaveApiKey}>Save API Key</Button>
          </CardContent>
        </Card>

        {/* Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Usage & Limits
            </CardTitle>
            <CardDescription>Your current usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Uploads Remaining</p>
                <p className="text-2xl font-bold">{uploadsRemaining}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Suggestions Remaining</p>
                <p className="text-2xl font-bold">{suggestionsRemaining}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              These are mock limits. In a real app, they would be tied to your subscription plan.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div>
              <h4 className="font-medium mb-2">Sign Out</h4>
              <p className="text-sm text-muted-foreground mb-4">Sign out of your account on this device</p>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
