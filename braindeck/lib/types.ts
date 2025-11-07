export type Subject = {
  id: string
  name: string
  createdAt: string
}

export type Deck = {
  id: string
  name: string
  subjectId: string
  createdAt: string
  cardCount: number
  dueToday: number
  lastReviewed?: string
}

export type Card = {
  id: string
  deckId: string
  type: "qa" | "cloze"
  front: string
  back: string
  tags: string[]
  createdAt: string
  flagged?: boolean
  interval?: number
  easeFactor?: number
  nextReview?: string
}

export type Upload = {
  id: string
  fileName: string
  sizeMB: number
  pageCount: number
  status: "queued" | "processing" | "done" | "error"
  createdAt: string
}

export type Suggestion = {
  id: string
  uploadId?: string
  subjectId?: string
  deckId?: string | null
  type: "qa" | "cloze"
  front: string
  back: string
  pageRefs: number[]
  confidence: number
  status: "new" | "accepted" | "edited" | "discarded"
  createdAt: string
}

export type ActivityItem = {
  id: string
  type: "card_accepted" | "upload_completed" | "deck_created"
  title: string
  description: string
  timestamp: string
}
