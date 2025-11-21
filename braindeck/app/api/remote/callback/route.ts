import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-callback-secret")
  if (secret !== process.env.CALLBACK_SECRET) {
    console.error("[callback] forbidden: bad secret")
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const payload = await req.json()
  const { jobId, deck, suggestions, error } = payload
  console.log("[callback] jobId:", jobId, "error:", error, "deckName:", deck?.name, "count:", suggestions?.length)

  try {
    if (error) {
      await supabaseAdmin.from("generation_jobs")
        .update({ status: "error", error: String(error), finished_at: new Date().toISOString() })
        .eq("upload_id", jobId)
      return NextResponse.json({ ok: true })
    }

    // load upload for user_id
    const { data: upload, error: upErr } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", jobId)
      .single()
    if (upErr || !upload) {
      console.error("[callback] upload not found", upErr)
      return NextResponse.json({ error: "upload not found" }, { status: 404 })
    }

    // create deck
    const deckName = deck?.name || upload.file_name.replace(/\.[^.]+$/, "")
    const { data: deckRow, error: deckErr } = await supabaseAdmin
      .from("decks")
      .insert({
        user_id: upload.user_id,
        subject_id: deck?.subjectId ?? upload.subject_id,
        name: deckName
      })
      .select("*")
      .single()

    if (deckErr) {
      console.error("[callback] deck insert failed", deckErr)
      await supabaseAdmin.from("generation_jobs")
        .update({ status: "error", error: `deck insert: ${deckErr.message}`, finished_at: new Date().toISOString() })
        .eq("upload_id", jobId)
      return NextResponse.json({ error: deckErr.message }, { status: 500 })
    }

    // insert cards
    if (Array.isArray(suggestions) && suggestions.length) {
      const rows = suggestions.map((s: any) => ({
        user_id: upload.user_id,
        deck_id: deckRow.id,
        type: s.type === "cloze" ? "cloze" : "qa",
        front: String(s.front).trim(),
        back: String(s.back).trim(),
        tags: [`difficulty:${s.difficulty ?? "medium"}`],
        prov_source: "pdf",
        prov_upload_id: upload.id,
        prov_page_refs: Array.isArray(s.pageRefs) ? s.pageRefs.map((n: any) => Math.max(1, Math.floor(Number(n)))) : []
      }))
      const { error: cardErr } = await supabaseAdmin.from("cards").insert(rows)
      if (cardErr) {
        console.error("[callback] cards insert failed", cardErr)
        await supabaseAdmin.from("generation_jobs")
          .update({ status: "error", error: `cards insert: ${cardErr.message}`, finished_at: new Date().toISOString() })
          .eq("upload_id", jobId)
        return NextResponse.json({ error: cardErr.message }, { status: 500 })
      }
    }

    await supabaseAdmin.from("generation_jobs")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("upload_id", jobId)

    console.log("[callback] done deckId:", deckRow.id)
    return NextResponse.json({ ok: true, deckId: deckRow.id })
  } catch (e: any) {
    console.error("[callback] exception", e)
    await supabaseAdmin.from("generation_jobs")
      .update({ status: "error", error: String(e), finished_at: new Date().toISOString() })
      .eq("upload_id", payload?.jobId ?? "unknown")
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

