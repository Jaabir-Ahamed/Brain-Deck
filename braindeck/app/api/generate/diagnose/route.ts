import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { extractPagesFromBuffer, chunkPages } from "@/lib/pdf"
import { askOllamaJSON } from "@/lib/ollama"
import { SuggestionsPayloadSchema } from "@/lib/ai_schema"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { uploadId, preferVL = false } = await req.json()

    // Load upload
    const { data: upload, error: upErr } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single()

    if (upErr || !upload) {
      return NextResponse.json({ error: "upload not found" }, { status: 404 })
    }

    // Download file
    const { data: signed } = await supabaseAdmin
      .storage
      .from("uploads")
      .createSignedUrl(upload.storage_path, 600)

    if (!signed?.signedUrl) {
      return NextResponse.json({ error: "signed url failed" }, { status: 500 })
    }

    const buf = Buffer.from(await (await fetch(signed.signedUrl)).arrayBuffer())

    // Extract text
    const { pages } = await extractPagesFromBuffer(buf)
    const totalChars = pages.reduce((n, p) => n + p.length, 0)
    const looksScanned = totalChars < 400 && pages.length > 0

    // Determine model
    const useVL = preferVL || looksScanned
    const model = useVL
      ? (process.env.OLLAMA_MODEL_VL ?? "qwen2.5vl:7b")
      : (process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct")

    // Only test first chunk for diagnostics
    const chunks = chunkPages(pages, { maxChars: 3000, windowPages: 2 }).slice(0, 1)

    if (!chunks.length || !chunks[0]) {
      return NextResponse.json({
        error: "No text extracted from PDF. Try the Vision toggle (scanned PDF).",
        looksScanned,
        pages: pages.length,
        totalChars,
      })
    }

    const system = `You create high-quality flashcards from the provided text ONLY.
One atomic fact per card. No hallucinations.
Each suggestion must include a difficulty: "easy" | "medium" | "hard".
Return strict JSON:
{"suggestions":[{"type":"qa|cloze","front":"...","back":"...","pageRefs":[int,...],"confidence":0..1,"difficulty":"easy|medium|hard"}]}`

    const user = `PAGES ${chunks[0].pageStart}-${chunks[0].pageEnd}:\n${chunks[0].text}\n\nReturn at most 6 suggestions.`

    const json = await askOllamaJSON(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { model }
    )

    const parsed = SuggestionsPayloadSchema.safeParse(json)

    return NextResponse.json({
      looksScanned,
      pages: pages.length,
      totalChars,
      model,
      ok: parsed.success,
      sample: parsed.success ? parsed.data : json,
      errors: parsed.success ? null : parsed.error.format(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

