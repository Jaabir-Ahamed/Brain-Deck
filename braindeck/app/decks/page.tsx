"use client"

import { useState } from "react"
import Link from "next/link"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { DataTable } from "@/components/data-table"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Plus, Trash2, Play } from "lucide-react"
import { toast } from "sonner"

export default function DecksPage() {
  const { decks, subjects, addDeck, deleteDeck } = useAppStore()
  const [newDeckName, setNewDeckName] = useState("")
  const [newDeckSubject, setNewDeckSubject] = useState("")
  const [open, setOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; deckId: string }>({
    open: false,
    deckId: "",
  })

  const handleAddDeck = () => {
    if (!newDeckName.trim() || !newDeckSubject) {
      toast.error("Please fill in all fields")
      return
    }

    addDeck(newDeckName, newDeckSubject)
    toast.success("Deck created")
    setNewDeckName("")
    setNewDeckSubject("")
    setOpen(false)
  }

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId)
    toast.success("Deck deleted")
    setDeleteConfirm({ open: false, deckId: "" })
  }

  const getSubjectName = (subjectId: string) => {
    return subjects.find((s) => s.id === subjectId)?.name || "Unknown"
  }

  const columns = [
    {
      key: "name" as const,
      label: "Name",
      render: (value: string, item: any) => (
        <Link href={`/decks/${item.id}`} className="text-primary hover:underline font-medium">
          {value}
        </Link>
      ),
    },
    {
      key: "subjectId" as const,
      label: "Subject",
      render: (value: string) => getSubjectName(value),
    },
    {
      key: "cardCount" as const,
      label: "Cards",
    },
    {
      key: "dueToday" as const,
      label: "Due Today",
    },
    {
      key: "lastReviewed" as const,
      label: "Last Reviewed",
      render: (value: string | undefined) => (value ? new Date(value).toLocaleDateString() : "Never"),
    },
    {
      key: "id" as const,
      label: "Actions",
      render: (value: string, item: any) => (
        <div className="flex gap-2">
          <Link href={`/study/${item.id}`}>
            <Button variant="ghost" size="sm">
              <Play className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm({ open: true, deckId: item.id })}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Decks</h1>
            <p className="text-muted-foreground mt-2">Manage your study decks</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Deck</DialogTitle>
                <DialogDescription>Add a new deck to your collection</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Deck Name</label>
                  <Input
                    placeholder="e.g., Cell Biology"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={newDeckSubject} onValueChange={setNewDeckSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddDeck}>Create Deck</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-lg mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-4">Create your first deck to start studying</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Deck
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Deck</DialogTitle>
                  <DialogDescription>Add a new deck to your collection</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Deck Name</label>
                    <Input
                      placeholder="e.g., Cell Biology"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={newDeckSubject} onValueChange={setNewDeckSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddDeck}>Create Deck</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <DataTable data={decks} columns={columns} searchKey="name" />
        )}
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Deck"
        description="Are you sure you want to delete this deck? This action cannot be undone."
        actionLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => handleDeleteDeck(deleteConfirm.deckId)}
        isDestructive
      />
    </AppShell>
  )
}
