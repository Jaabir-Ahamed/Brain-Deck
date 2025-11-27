"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Card } from "@/lib/types"

interface CardEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: Card
  onSave: (card: Omit<Card, "id" | "createdAt">) => void
}

export function CardEditorDialog({ open, onOpenChange, card, onSave }: CardEditorDialogProps) {
  const [front, setFront] = useState(card?.front || "")
  const [back, setBack] = useState(card?.back || "")
  const [type, setType] = useState<"qa" | "cloze">(card?.type || "qa")
  const [tags, setTags] = useState(card?.tags.join(", ") || "")

  const handleSave = () => {
    if (!front.trim() || !back.trim()) {
      return
    }

    onSave({
      deckId: card?.deckId || "",
      type,
      front,
      back,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      flagged: card?.flagged || false,
    })

    setFront("")
    setBack("")
    setType("qa")
    setTags("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{card ? "Edit Card" : "Create Card"}</DialogTitle>
          <DialogDescription>Add or edit a flashcard</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={(value) => setType(value as "qa" | "cloze")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qa">Question & Answer</SelectItem>
                <SelectItem value="cloze">Cloze Deletion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Front</label>
            <Textarea placeholder="Question or prompt" value={front} onChange={(e) => setFront(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Back</label>
            <Textarea placeholder="Answer" value={back} onChange={(e) => setBack(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Tags (comma-separated)</label>
            <Input placeholder="e.g., biology, chapter-3" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Card</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
