import { create } from "zustand"
import type { Subject, Deck, Card, Upload, Suggestion } from "./types"
import { mockSubjects, mockDecks, mockCards, mockUploads, mockSuggestions } from "./mock-data"

interface AppStore {
  subjects: Subject[]
  decks: Deck[]
  cards: Card[]
  uploads: Upload[]
  suggestions: Suggestion[]

  // Subject actions
  addSubject: (name: string) => void
  deleteSubject: (id: string) => void

  // Deck actions
  addDeck: (name: string, subjectId: string) => void
  deleteDeck: (id: string) => void

  // Card actions
  addCard: (deckId: string, card: Omit<Card, "id" | "createdAt">) => void
  updateCard: (id: string, updates: Partial<Card>) => void
  deleteCard: (id: string) => void
  toggleCardFlag: (id: string) => void

  // Upload actions
  addUpload: (upload: Omit<Upload, "id" | "createdAt">) => void
  updateUploadStatus: (id: string, status: Upload["status"]) => void

  // Suggestion actions
  acceptSuggestion: (id: string, deckId: string) => void
  discardSuggestion: (id: string) => void
  editSuggestion: (id: string, updates: Partial<Suggestion>) => void
}

export const useAppStore = create<AppStore>((set) => ({
  subjects: mockSubjects,
  decks: mockDecks,
  cards: mockCards,
  uploads: mockUploads,
  suggestions: mockSuggestions,

  addSubject: (name) =>
    set((state) => ({
      subjects: [
        ...state.subjects,
        {
          id: `subj-${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  deleteSubject: (id) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== id),
      decks: state.decks.filter((d) => d.subjectId !== id),
    })),

  addDeck: (name, subjectId) =>
    set((state) => ({
      decks: [
        ...state.decks,
        {
          id: `deck-${Date.now()}`,
          name,
          subjectId,
          createdAt: new Date().toISOString(),
          cardCount: 0,
          dueToday: 0,
        },
      ],
    })),

  deleteDeck: (id) =>
    set((state) => ({
      decks: state.decks.filter((d) => d.id !== id),
      cards: state.cards.filter((c) => c.deckId !== id),
    })),

  addCard: (deckId, card) =>
    set((state) => {
      const newCard: Card = {
        ...card,
        id: `card-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }
      return {
        cards: [...state.cards, newCard],
        decks: state.decks.map((d) => (d.id === deckId ? { ...d, cardCount: d.cardCount + 1 } : d)),
      }
    }),

  updateCard: (id, updates) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  deleteCard: (id) =>
    set((state) => {
      const card = state.cards.find((c) => c.id === id)
      return {
        cards: state.cards.filter((c) => c.id !== id),
        decks: card
          ? state.decks.map((d) => (d.id === card.deckId ? { ...d, cardCount: Math.max(0, d.cardCount - 1) } : d))
          : state.decks,
      }
    }),

  toggleCardFlag: (id) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, flagged: !c.flagged } : c)),
    })),

  addUpload: (upload) =>
    set((state) => ({
      uploads: [
        ...state.uploads,
        {
          ...upload,
          id: `upload-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateUploadStatus: (id, status) =>
    set((state) => ({
      uploads: state.uploads.map((u) => (u.id === id ? { ...u, status } : u)),
    })),

  acceptSuggestion: (id, deckId) =>
    set((state) => {
      const suggestion = state.suggestions.find((s) => s.id === id)
      if (!suggestion) return state

      return {
        suggestions: state.suggestions.map((s) => (s.id === id ? { ...s, status: "accepted", deckId } : s)),
        cards: [
          ...state.cards,
          {
            id: `card-${Date.now()}`,
            deckId,
            type: suggestion.type,
            front: suggestion.front,
            back: suggestion.back,
            tags: [],
            createdAt: new Date().toISOString(),
          },
        ],
        decks: state.decks.map((d) => (d.id === deckId ? { ...d, cardCount: d.cardCount + 1 } : d)),
      }
    }),

  discardSuggestion: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === id ? { ...s, status: "discarded" } : s)),
    })),

  editSuggestion: (id, updates) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) => (s.id === id ? { ...s, ...updates, status: "edited" } : s)),
    })),
}))
