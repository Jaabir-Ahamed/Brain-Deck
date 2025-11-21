import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { extractPagesFromBuffer, chunkPages } from "@/lib/pdf"
import { askGeminiJSON } from "@/lib/gemini"
import { SuggestionsPayloadSchema } from "@/lib/ai_schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const SYS = `You create high-quality flashcards from the provided text ONLY.

- One atomic fact per card. No hallucinations.

- Include difficulty: "easy" | "medium" | "hard".

Return STRICT JSON:

{"suggestions":[{"type":"qa|cloze","front":"...","back":"...","pageRefs":[int,...],"confidence":0..1,"difficulty":"easy|medium|hard"}]}`

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is missing.")

    const { uploadId, subjectId, targetCount = 40 } = await req.json()
    console.log("[generate-gemini] uploadId:", uploadId, "target:", targetCount)

    // 1) Load upload & mark processing
    const { data: upload, error: upErr } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single()
    if (upErr || !upload) return NextResponse.json({ error: "upload not found" }, { status: 404 })

    // Update both uploads and generation_jobs status
    await supabaseAdmin
      .from("uploads")
      .update({ status: "processing" })
      .eq("id", uploadId)
    
    await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("upload_id", uploadId)

    // 2) Download the PDF (signed url)
    const { data: signed } = await supabaseAdmin
      .storage.from("uploads")
      .createSignedUrl(upload.storage_path, 60 * 30)
    if (!signed?.signedUrl) throw new Error("signed url failed")

    const buf = Buffer.from(await (await fetch(signed.signedUrl)).arrayBuffer())

    // 3) Extract text
    const { pages } = await extractPagesFromBuffer(buf)
    if (!pages.length) throw new Error("No text found in PDF (try an OCR'd PDF).")

    // 4) Create deck
    const deckName = upload.file_name.replace(/\.[^.]+$/, "")
    const { data: deck, error: deckErr } = await supabaseAdmin
      .from("decks")
      .insert({
        user_id: upload.user_id,
        subject_id: subjectId ?? upload.subject_id,
        name: deckName
      })
      .select("*")
      .single()
    if (deckErr) throw new Error(deckErr.message)

    // 5) Chunk + call Gemini
    const chunks = chunkPages(pages, 4000, 2)
    let made = 0

    for (let i = 0; i < chunks.length && made < targetCount; i++) {
      const w = chunks[i]

      const user = `Pages ${w.pageStart}-${w.pageEnd}:\n${w.text}\n\nReturn at most ${
        Math.max(1, Math.ceil((targetCount - made) / Math.max(1, chunks.length - i)))
      } suggestions.`

      const json = await askGeminiJSON(SYS, user)
      const ok = SuggestionsPayloadSchema.safeParse(json)

      if (!ok.success) {
        console.warn("[generate-gemini] bad schema on chunk", i + 1)
        continue
      }

      const rows = []
      for (const s of ok.data.suggestions) {
        if (made >= targetCount) break

        rows.push({
          user_id: upload.user_id,
          deck_id: deck.id,
          type: s.type === "cloze" ? "cloze" : "qa",
          front: String(s.front).trim(),
          back: String(s.back).trim(),
          tags: [`difficulty:${s.difficulty}`],
          prov_source: "pdf",
          prov_upload_id: upload.id,
          prov_page_refs: s.pageRefs.map((n) => Math.max(1, Math.floor(n)))
        })

        made++
      }

      if (rows.length) await supabaseAdmin.from("cards").insert(rows)
    }

    // 6) Finish
    await supabaseAdmin
      .from("uploads")
      .update({ status: "done" })
      .eq("id", uploadId)
    
    await supabaseAdmin
      .from("generation_jobs")
      .update({ status: "done", finished_at: new Date().toISOString() })
      .eq("upload_id", uploadId)

    console.log("[generate-gemini] done deckId:", deck.id, "cards:", made)
    return NextResponse.json({ ok: true, deckId: deck.id, created: made }, { status: 200 })
  } catch (e: any) {
    console.error("[generate-gemini] error", e)
    try {
      const body = await req.json().catch(() => ({}))
      const uploadId = body.uploadId
      if (uploadId) {
        await supabaseAdmin
          .from("uploads")
          .update({ status: "error" })
          .eq("id", uploadId)
        
        await supabaseAdmin
          .from("generation_jobs")
          .update({ status: "error", error: String(e), finished_at: new Date().toISOString() })
          .eq("upload_id", uploadId)
      }
    } catch {}
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
