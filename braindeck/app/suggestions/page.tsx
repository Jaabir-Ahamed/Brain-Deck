"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { SuggestionItem } from "@/components/suggestion-item"
import { CardEditorDialog } from "@/components/card-editor-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Lightbulb } from "lucide-react"
import { toast } from "sonner"
import type { Suggestion } from "@/lib/types"

export default function SuggestionsPage() {
  const { suggestions, decks, subjects, acceptSuggestion, discardSuggestion, editSuggestion } = useAppStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [filterDeck, setFilterDeck] = useState("")
  const [filterType, setFilterType] = useState("")
  const [confidenceRange, setConfidenceRange] = useState([0, 1])
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | undefined>()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [acceptDeckId, setAcceptDeckId] = useState("")
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [pendingAcceptId, setPendingAcceptId] = useState("")

  const newSuggestions = suggestions.filter((s) => s.status === "new")

  const filteredSuggestions = newSuggestions.filter((s) => {
    const matchesSearch =
      s.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.back.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = !filterSubject || s.subjectId === filterSubject
    const matchesDeck = !filterDeck || s.deckId === filterDeck
    const matchesType = !filterType || s.type === filterType
    const matchesConfidence = s.confidence >= confidenceRange[0] && s.confidence <= confidenceRange[1]

    return matchesSearch && matchesSubject && matchesDeck && matchesType && matchesConfidence
  })

  const handleAccept = (suggestionId: string) => {
    setPendingAcceptId(suggestionId)
    setAcceptDialogOpen(true)
  }

  const handleConfirmAccept = () => {
    if (acceptDeckId && pendingAcceptId) {
      acceptSuggestion(pendingAcceptId, acceptDeckId)
      toast.success("Suggestion accepted (mock)")
      setAcceptDeckId("")
      setAcceptDialogOpen(false)
      setPendingAcceptId("")
    }
  }

  const handleDiscard = (suggestionId: string) => {
    discardSuggestion(suggestionId)
    toast.success("Suggestion discarded (mock)")
  }

  const handleEdit = (suggestion: Suggestion) => {
    setEditingSuggestion(suggestion)
    setEditDialogOpen(true)
  }

  const handleSaveEdit = (cardData: any) => {
    if (editingSuggestion) {
      editSuggestion(editingSuggestion.id, {
        front: cardData.front,
        back: cardData.back,
        type: cardData.type,
      })
      toast.success("Suggestion updated (mock)")
      setEditingSuggestion(undefined)
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Suggestions</h1>
          <p className="text-muted-foreground mt-2">Review and accept AI-generated flashcard suggestions</p>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="qa">Q&A</SelectItem>
                  <SelectItem value="cloze">Cloze</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confidence</label>
              <Slider
                value={confidenceRange}
                onValueChange={setConfidenceRange}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {(confidenceRange[0] * 100).toFixed(0)}% - {(confidenceRange[1] * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        {filteredSuggestions.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Lightbulb className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">
                {newSuggestions.length === 0 ? "No suggestions yet" : "No suggestions match your filters"}
              </h3>
              <p className="text-muted-foreground">
                {newSuggestions.length === 0 ? "Upload a PDF to generate suggestions" : "Try adjusting your filters"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSuggestions.length} of {newSuggestions.length} suggestions
            </p>
            {filteredSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={() => handleAccept(suggestion.id)}
                onDiscard={() => handleDiscard(suggestion.id)}
                onEdit={() => handleEdit(suggestion)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Accept Dialog */}
      {acceptDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Select Deck</h3>
              <Select value={acceptDeckId} onValueChange={setAcceptDeckId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a deck" />
                </SelectTrigger>
                <SelectContent>
                  {decks.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setAcceptDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirmAccept} disabled={!acceptDeckId}>
                  Accept
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Dialog */}
      <CardEditorDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        card={editingSuggestion as any}
        onSave={handleSaveEdit}
      />
    </AppShell>
  )
}
