"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2, Plus, Layers } from "lucide-react"
import { toast } from "sonner"

export default function SubjectsPage() {
  const { subjects, decks, addSubject, deleteSubject } = useAppStore()
  const [newSubjectName, setNewSubjectName] = useState("")
  const [open, setOpen] = useState(false)

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) {
      toast.error("Please enter a subject name")
      return
    }

    addSubject(newSubjectName)
    toast.success("Subject created")
    setNewSubjectName("")
    setOpen(false)
  }

  const handleDeleteSubject = (id: string) => {
    deleteSubject(id)
    toast.success("Subject deleted")
  }

  const getSubjectStats = (subjectId: string) => {
    const subjectDecks = decks.filter((d) => d.subjectId === subjectId)
    const totalCards = subjectDecks.reduce((sum, d) => sum + d.cardCount, 0)
    return {
      deckCount: subjectDecks.length,
      cardCount: totalCards,
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Subjects</h1>
            <p className="text-muted-foreground mt-2">Organize your learning by subject</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription>Add a new subject to organize your decks</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Subject name (e.g., Biology, History)"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubject}>Create Subject</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No subjects yet</h3>
              <p className="text-muted-foreground mb-4">Create your first subject to get started</p>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Subject
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Subject</DialogTitle>
                    <DialogDescription>Add a new subject to organize your decks</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Subject name (e.g., Biology, History)"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddSubject}>Create Subject</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const stats = getSubjectStats(subject.id)
              return (
                <Card key={subject.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{subject.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {stats.deckCount} deck{stats.deckCount !== 1 ? "s" : ""} • {stats.cardCount} card
                          {stats.cardCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSubject(subject.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
