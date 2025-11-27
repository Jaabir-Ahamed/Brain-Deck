import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { extractPagesFromBuffer, chunkPages } from "@/lib/pdf"
import { askOllamaJSON } from "@/lib/ollama"
import { SuggestionsPayloadSchema } from "@/lib/ai_schema"
import { setJobStatus } from "@/lib/progress"

export const dynamic = "force-dynamic"

type Body = {
  uploadId: string
  subjectId?: string
  targetCount?: number
  preferVL?: boolean
}

export async function POST(req: NextRequest) {
  let uploadId: string | undefined

  try {
    const body = (await req.json()) as Body
    uploadId = body.uploadId
    const { subjectId, targetCount = 50, preferVL = false } = body

    // 1) Load upload & mark processing
    const { data: upload, error: upErr } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single()

    if (upErr || !upload) {
      return NextResponse.json({ error: "upload not found" }, { status: 404 })
    }

    // Mark as processing so UI isn't stuck
    await setJobStatus(supabaseAdmin, uploadId, "processing")

    // 2) Download file
    const { data: signed } = await supabaseAdmin
      .storage
      .from("uploads")
      .createSignedUrl(upload.storage_path, 600)

    if (!signed?.signedUrl) {
      throw new Error("signed url failed")
    }

    const buf = Buffer.from(await (await fetch(signed.signedUrl)).arrayBuffer())

    // 3) Parse PDF
    const { pages } = await extractPagesFromBuffer(buf)

    if (!pages.length) {
      throw new Error(
        "No text extracted from PDF. Try the Vision toggle (scanned PDF)."
      )
    }

    const totalChars = pages.reduce((n, p) => n + p.length, 0)
    const looksScanned = totalChars < 400 && pages.length > 0
    const useVL = preferVL || looksScanned

    // 4) Build chunks
    const chunks = chunkPages(pages, { maxChars: 4000, windowPages: 2 })
    const model = useVL
      ? (process.env.OLLAMA_MODEL_VL ?? "qwen2.5vl:7b")
      : (process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct")

    // 5) Create deck (one per upload)
    const deckName = upload.file_name.replace(/\.[^.]+$/, "") || "Untitled Deck"
    const { data: deck, error: deckError } = await supabaseAdmin
      .from("decks")
      .insert({
        user_id: upload.user_id,
        subject_id: subjectId ?? upload.subject_id,
        name: deckName,
      })
      .select("*")
      .single()

    if (deckError || !deck) {
      throw new Error(`Failed to create deck: ${deckError?.message}`)
    }

    // 6) Generate cards in batches
    let made = 0

    for (let i = 0; i < chunks.length && made < targetCount; i++) {
      const w = chunks[i]

      const system = `You create high-quality flashcards from the provided text ONLY.
One atomic fact per card. No hallucinations.
Each suggestion must include a difficulty: "easy" | "medium" | "hard".
Return strict JSON:
{"suggestions":[{"type":"qa|cloze","front":"...","back":"...","pageRefs":[int,...],"confidence":0..1,"difficulty":"easy|medium|hard"}]}`

      const requestedCount = Math.max(
        1,
        Math.ceil((targetCount - made) / Math.max(1, chunks.length - i))
      )

      const user = `PAGES ${w.pageStart}-${w.pageEnd}:\n${w.text}\n\nReturn at most ${requestedCount} suggestions.`

      const json = await askOllamaJSON(
        [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        { model }
      )

      const parsed = SuggestionsPayloadSchema.safeParse(json)

      if (!parsed.success) {
        console.warn(
          `Validation failed for chunk ${i}:`,
          parsed.error.format()
        )
        continue
      }

      // Insert cards
      for (const s of parsed.data.suggestions) {
        if (made >= targetCount) break

        // Tag difficulty in tags array
        const tags = [`difficulty:${s.difficulty}`]

        const { data: card, error: cardErr } = await supabaseAdmin
          .from("cards")
          .insert({
            user_id: upload.user_id,
            deck_id: deck.id,
            type: s.type,
            front: s.front.trim(),
            back: s.back.trim(),
            tags,
            prov_source: "pdf" as const,
            prov_upload_id: upload.id,
            prov_page_refs: s.pageRefs,
          })
          .select("id")
          .single()

        if (!cardErr && card) {
          // Initialize SRS entry
          await supabaseAdmin.from("srs").insert({
            card_id: card.id,
            ease: 2.5,
            interval_days: 0,
            due: new Date().toISOString().split("T")[0],
            last_reviewed: new Date().toISOString().split("T")[0],
          })

          made++
        }
      }
    }

    // 7) Mark as done
    await setJobStatus(supabaseAdmin, uploadId, "done")

    return NextResponse.json({
      created: made,
      deckId: deck.id,
      deckName,
      model: useVL ? "qwen2.5vl:7b" : "qwen2.5:7b-instruct",
    })
  } catch (e: any) {
    console.error("Generation error:", e)

    // Mark as error
    if (uploadId) {
      try {
        await setJobStatus(supabaseAdmin, uploadId, "error", String(e))
      } catch (statusErr) {
        console.error("Failed to update status:", statusErr)
      }
    }

    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
