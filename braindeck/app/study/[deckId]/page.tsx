"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { StudyGrader } from "@/components/study-grader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string
  const { decks, cards, updateCard } = useAppStore()

  const deck = decks.find((d) => d.id === deckId)
  const deckCards = cards.filter((c) => c.deckId === deckId)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        setIsFlipped(!isFlipped)
      }
      if (["1", "2", "3", "4"].includes(e.key) && !completed) {
        handleGrade(Number(e.key) as 1 | 2 | 3 | 4)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [isFlipped, completed])

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

  if (deckCards.length === 0) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold">No cards in this deck</h1>
          <p className="text-muted-foreground mt-2">Add some cards to start studying</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AppShell>
    )
  }

  const currentCard = deckCards[currentIndex]

  const handleGrade = (grade: 1 | 2 | 3 | 4) => {
    const gradeLabels = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" }
    toast.success(`Graded as ${gradeLabels[grade]} (mock)`)

    updateCard(currentCard.id, {
      easeFactor: Math.max(1.3, (currentCard.easeFactor || 2.5) + (grade - 2.5) * 0.1),
      interval: Math.max(1, (currentCard.interval || 1) * (grade > 2 ? 1.5 : 0.5)),
    })

    if (currentIndex < deckCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      setCompleted(true)
    }
  }

  const handleReset = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setCompleted(false)
  }

  if (completed) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🎉</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Study Session Complete!</h1>
            <p className="text-muted-foreground mb-8">You reviewed {deckCards.length} cards</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Deck
              </Button>
              <Button onClick={handleReset}>Study Again</Button>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground mt-1">Study Mode</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>

        {/* Flashcard */}
        <div
          className="h-64 cursor-pointer perspective"
          onClick={() => setIsFlipped(!isFlipped)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.code === "Space") {
              e.preventDefault()
              setIsFlipped(!isFlipped)
            }
          }}
        >
          <Card className="h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:shadow-lg transition-shadow">
            <CardContent className="text-center p-8">
              <p className="text-sm text-muted-foreground mb-4">{isFlipped ? "Answer" : "Question"}</p>
              <p className="text-2xl font-semibold leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
              <p className="text-xs text-muted-foreground mt-6">Press Space or click to flip</p>
            </CardContent>
          </Card>
        </div>

        {/* Grader */}
        {isFlipped && (
          <div className="animate-in fade-in duration-300">
            <StudyGrader
              currentIndex={currentIndex}
              total={deckCards.length}
              onGrade={handleGrade}
              onReset={handleReset}
            />
          </div>
        )}

        {!isFlipped && (
          <div className="text-center">
            <p className="text-muted-foreground">Flip the card to reveal the answer</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
