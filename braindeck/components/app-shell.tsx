"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BookOpen, Layers, Upload, Lightbulb, User, Menu, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

const sidebarItems = [
  {
    group: "Core",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/uploads", label: "Uploads", icon: Upload },
      { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/decks", label: "Decks", icon: BookOpen },
      { href: "/subjects", label: "Subjects", icon: Layers },
    ],
  },
  {
    group: "You",
    items: [{ href: "/profile", label: "Profile", icon: User }],
  },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage) {
    return <>{children}</>
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">BrainDeck</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-8">
        {sidebarItems.map((group) => (
          <div key={group.group}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-3">
              {group.group}
            </p>
            <div className="space-y-2">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3" asChild>
                      <span>
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border flex-col bg-card">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-40">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">BrainDeck</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome back!</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">{children}</div>
        </div>
      </main>
    </div>
  )
}
