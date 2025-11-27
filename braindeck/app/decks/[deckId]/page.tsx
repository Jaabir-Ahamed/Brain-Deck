"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { DataTable } from "@/components/data-table"
import { CardEditorDialog } from "@/components/card-editor-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Flag, Plus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Card as CardType } from "@/lib/types"

export default function DeckDetailPage() {
  const params = useParams()
  const deckId = params.deckId as string
  const { decks, cards, subjects, addCard, updateCard, deleteCard, toggleCardFlag } = useAppStore()

  const deck = decks.find((d) => d.id === deckId)
  const deckCards = cards.filter((c) => c.deckId === deckId)
  const subject = subjects.find((s) => s.id === deck?.subjectId)

  const [editingCard, setEditingCard] = useState<CardType | undefined>()
  const [cardEditorOpen, setCardEditorOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; cardId: string }>({
    open: false,
    cardId: "",
  })

  if (!deck) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Deck not found</h1>
        </div>
      </AppShell>
    )
  }

  const handleAddCard = (cardData: Omit<CardType, "id" | "createdAt">) => {
    addCard(deckId, cardData)
    toast.success("Card added (mock)")
  }

  const handleEditCard = (card: CardType) => {
    setEditingCard(card)
    setCardEditorOpen(true)
  }

  const handleSaveCard = (cardData: Omit<CardType, "id" | "createdAt">) => {
    if (editingCard) {
      updateCard(editingCard.id, cardData)
      toast.success("Card updated (mock)")
    }
    setEditingCard(undefined)
  }

  const handleDeleteCard = (cardId: string) => {
    deleteCard(cardId)
    toast.success("Card deleted (mock)")
    setDeleteConfirm({ open: false, cardId: "" })
  }

  const flaggedCards = deckCards.filter((c) => c.flagged)

  const columns = [
    {
      key: "front" as const,
      label: "Front",
      render: (value: string) => <div className="max-w-xs truncate">{value}</div>,
    },
    {
      key: "back" as const,
      label: "Back",
      render: (value: string) => <div className="max-w-xs truncate">{value}</div>,
    },
    {
      key: "type" as const,
      label: "Type",
      render: (value: string) => <Badge variant="outline">{value === "qa" ? "Q&A" : "Cloze"}</Badge>,
    },
    {
      key: "id" as const,
      label: "Actions",
      render: (value: string, item: CardType) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleCardFlag(item.id)}
            className={item.flagged ? "text-yellow-500" : ""}
          >
            <Flag className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditCard(item)}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm({ open: true, cardId: item.id })}
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
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{deck.name}</h1>
              {subject && <Badge variant="secondary">{subject.name}</Badge>}
            </div>
            <p className="text-muted-foreground">
              Manage your flashcards
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="flags">Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setEditingCard(undefined)
                  setCardEditorOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
            {deckCards.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground mb-4">No cards in this deck yet</p>
                  <Button
                    onClick={() => {
                      setEditingCard(undefined)
                      setCardEditorOpen(true)
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Card
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <DataTable data={deckCards} columns={columns} searchKey="front" />
            )}
          </TabsContent>

          <TabsContent value="flags" className="space-y-4">
            {flaggedCards.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No flagged cards</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {flaggedCards.map((card) => (
                  <Card key={card.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="font-medium">{card.front}</p>
                        <p className="text-sm text-muted-foreground">{card.back}</p>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCardFlag(card.id)}
                            className="text-yellow-500"
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            Clear Flag
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CardEditorDialog
        open={cardEditorOpen}
        onOpenChange={setCardEditorOpen}
        card={editingCard}
        onSave={editingCard ? handleSaveCard : handleAddCard}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Card"
        description="Are you sure you want to delete this card?"
        actionLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => handleDeleteCard(deleteConfirm.cardId)}
        isDestructive
      />
    </AppShell>
  )
}
