"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { User, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = supabaseBrowser()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push("/auth/signin")
          return
        }

        setUserId(user.id)
        setEmail(user.email || "")

        // Fetch profile data from profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single()

        if (profile?.display_name) {
          setDisplayName(profile.display_name)
        } else {
          // Use email username as fallback
          const username = user.email?.split("@")[0] || "User"
          setDisplayName(username)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const supabase = supabaseBrowser()
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(`Failed to update profile: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = supabaseBrowser()
      await supabase.auth.signOut()
      toast.success("Signed out successfully")
      router.push("/auth/signin")
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password to confirm")
      return
    }

    setIsDeleting(true)
    try {
      const supabase = supabaseBrowser()

      // Re-authenticate with password to confirm
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: deletePassword,
      })

      if (signInError) {
        throw new Error("Invalid password. Please try again.")
      }

      // Call delete account API
      const response = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete account")
      }

      // Sign out
      await supabase.auth.signOut()

      toast.success("Account deleted successfully")
      router.push("/auth/signup")
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast.error(error.message || "Failed to delete account")
    } finally {
      setIsDeleting(false)
      setDeletePassword("")
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
                <Button onClick={handleSaveName} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Read-only • Contact support to change your email
              </p>
              <Input id="email" value={email} disabled className="mt-2" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sign Out */}
            <div>
              <h4 className="font-medium mb-2">Sign Out</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Sign out of your account on this device
              </p>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Sign Out
              </Button>
            </div>

            <Separator />

            {/* Delete Account */}
            <div>
              <h4 className="font-medium mb-2 text-destructive">Delete Account</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account and
                      remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="py-4">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Enter your password to confirm
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Your password"
                      className="mt-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && deletePassword) {
                          handleDeleteAccount()
                        }
                      }}
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletePassword("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={!deletePassword || isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
