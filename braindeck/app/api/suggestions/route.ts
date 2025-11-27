import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// GET /api/suggestions?uploadId=...&status=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uploadId = searchParams.get("uploadId")
    const status = searchParams.get("status")
    const userId = searchParams.get("userId")

    let query = supabaseAdmin.from("suggestions").select("*")

    if (uploadId) {
      query = query.eq("upload_id", uploadId)
    }
    if (status) {
      query = query.eq("status", status)
    }
    if (userId) {
      query = query.eq("user_id", userId)
    }

    query = query.order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/suggestions?id=...
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("suggestions").update(body).eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/suggestions/accept
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { suggestionId, deckId } = body

    if (!suggestionId || !deckId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get suggestion
    const { data: suggestion, error: sugError } = await supabaseAdmin
      .from("suggestions")
      .select("*")
      .eq("id", suggestionId)
      .single()

    if (sugError || !suggestion) {
      return NextResponse.json({ error: "Suggestion not found" }, { status: 404 })
    }

    // Create card
    const { data: card, error: cardError } = await supabaseAdmin
      .from("cards")
      .insert({
        user_id: suggestion.user_id,
        deck_id: deckId,
        type: suggestion.type,
        front: suggestion.front,
        back: suggestion.back,
        tags: [],
        prov_source: "pdf",
        prov_upload_id: suggestion.upload_id,
        prov_page_refs: suggestion.page_refs,
      })
      .select()
      .single()

    if (cardError) throw cardError

    // Initialize SRS
    await supabaseAdmin.from("srs").insert({
      card_id: card.id,
      ease: 2.5,
      interval_days: 0,
      due: new Date().toISOString().split("T")[0],
      last_reviewed: new Date().toISOString().split("T")[0],
    })

    // Update suggestion status
    await supabaseAdmin
      .from("suggestions")
      .update({ status: "accepted", deck_id: deckId })
      .eq("id", suggestionId)

    return NextResponse.json({ success: true, card })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

