import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// GET /api/cards?deckId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const deckId = searchParams.get("deckId")

    if (!deckId) {
      return NextResponse.json({ error: "Missing deckId" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("cards")
      .select("*")
      .eq("deck_id", deckId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/cards
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { deck_id, user_id, type, front, back, tags, prov_source, prov_upload_id, prov_page_refs } = body

    if (!deck_id || !user_id || !type || !front || !back) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("cards")
      .insert({
        deck_id,
        user_id,
        type,
        front,
        back,
        tags: tags || [],
        prov_source: prov_source || "manual",
        prov_upload_id: prov_upload_id || null,
        prov_page_refs: prov_page_refs || [],
      })
      .select()
      .single()

    if (error) throw error

    // Initialize SRS entry
    await supabaseAdmin.from("srs").insert({
      card_id: data.id,
      ease: 2.5,
      interval_days: 0,
      due: new Date().toISOString().split("T")[0],
      last_reviewed: new Date().toISOString().split("T")[0],
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/cards?id=...
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("cards").update(body).eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/cards?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("cards").delete().eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

