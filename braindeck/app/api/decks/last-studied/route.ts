import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// GET /api/decks/last-studied?userId=...
// Returns the last studied deck, or the latest deck if none have been studied
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // First, try to find the last studied deck by checking SRS table for last_reviewed
    // Get the most recently reviewed card and its deck
    const { data: lastReviewedSrs } = await supabaseAdmin
      .from("srs")
      .select("card_id, last_reviewed")
      .not("last_reviewed", "is", null)
      .order("last_reviewed", { ascending: false })
      .limit(1)
      .single()
      .catch(() => null)

    if (lastReviewedSrs?.card_id) {
      // Get the card to find its deck
      const { data: card } = await supabaseAdmin
        .from("cards")
        .select("deck_id, user_id")
        .eq("id", lastReviewedSrs.card_id)
        .eq("user_id", userId)
        .single()
        .catch(() => null)

      if (card?.deck_id) {
        // Get the deck that was last studied
        const { data: deck, error: deckError } = await supabaseAdmin
          .from("decks")
          .select("*")
          .eq("id", card.deck_id)
          .eq("user_id", userId)
          .single()

        if (!deckError && deck) {
          return NextResponse.json({ deck })
        }
      }
    }

    // Also check review_events table if it exists
    const { data: lastReviewedEvent } = await supabaseAdmin
      .from("review_events")
      .select("deck_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .catch(() => null)

    if (lastReviewedEvent?.deck_id) {
      const { data: deck, error: deckError } = await supabaseAdmin
        .from("decks")
        .select("*")
        .eq("id", lastReviewedEvent.deck_id)
        .eq("user_id", userId)
        .single()

      if (!deckError && deck) {
        return NextResponse.json({ deck })
      }
    }

    // Fallback: get the latest deck created by the user
    const { data: latestDeck, error: latestError } = await supabaseAdmin
      .from("decks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (latestError || !latestDeck) {
      return NextResponse.json({ error: "No decks found" }, { status: 404 })
    }

    return NextResponse.json({ deck: latestDeck })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

