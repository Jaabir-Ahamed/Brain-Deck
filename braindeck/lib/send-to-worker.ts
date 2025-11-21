"use client"

import { supabaseBrowser } from "@/lib/supabase"

export async function sendPdfToWorker(file: File, opts: {
  subjectId?: string | null,
  targetCount?: number,
  preferVL?: boolean
} = {}) {
  const supabase = supabaseBrowser()

  // A) Confirm session
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw new Error(`Auth error: ${userErr.message}`)
  if (!user) throw new Error("You must be signed in to upload.")

  // B) Validate file
  if (!file || file.type !== "application/pdf") {
    throw new Error("Please choose a PDF file (.pdf).")
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("PDF is larger than 20MB.")
  }

  // C) Upload to Storage under userId/
  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
  const { error: upErr } = await supabase.storage.from("uploads").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: "application/pdf"
  })
  if (upErr) {
    // Common causes: policy mismatch, wrong bucket id, not authenticated
    throw new Error(`Storage upload failed: ${upErr.message} (path: ${path})`)
  }

  // D) Insert uploads row
  const sizeMB = file.size / (1024 * 1024)
  const { data: uploadRow, error: rowErr } = await supabase
    .from("uploads")
    .insert({
      user_id: user.id,
      subject_id: opts.subjectId ?? null,
      file_name: file.name,
      storage_path: path,
      size_mb: Number.parseFloat(sizeMB.toFixed(2)),
      status: "queued",
    })
    .select("*")
    .single()

  if (rowErr) {
    throw new Error(`DB insert (uploads) failed: ${rowErr.message}`)
  }

  // E) Insert job row
  const { error: jobErr } = await supabase
    .from("generation_jobs")
    .insert({ user_id: user.id, upload_id: uploadRow.id, status: "queued" })

  if (jobErr) {
    throw new Error(`DB insert (generation_jobs) failed: ${jobErr.message}`)
  }

  // F) Generate flashcards (use Gemini by default, or remote worker if preferVL is true)
  const useGemini = !opts.preferVL // Use Gemini unless vision model is explicitly requested
  
  if (useGemini) {
    // Call Gemini generation route
    const r = await fetch("/api/generate-gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId: uploadRow.id,
        subjectId: opts.subjectId ?? null,
        targetCount: opts.targetCount ?? 40,
        preferVision: opts.preferVL, // Pass vision flag to Gemini route
      }),
    })

    if (!r.ok) {
      const txt = await r.text().catch(() => "")
      throw new Error(`Gemini generation failed (${r.status}): ${txt || "see server logs"}`)
    }
  } else {
    // Dispatch to remote worker (server route does signing + post)
    const r = await fetch("/api/remote/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId: uploadRow.id,
        subjectId: opts.subjectId ?? null,
        targetCount: opts.targetCount ?? 40,
        preferVL: true,
      }),
    })

    if (!r.ok) {
      const txt = await r.text().catch(() => "")
      throw new Error(`Dispatch failed (${r.status}): ${txt || "see server logs"}`)
    }
  }

  // G) Poll job status
  for (let i = 0; i < 120; i++) {
    const { data: job, error: jErr } = await supabase
      .from("generation_jobs")
      .select("status,error")
      .eq("upload_id", uploadRow.id)
      .single()

    if (jErr) throw new Error(`Job poll error: ${jErr.message}`)
    if (job?.status === "done") return { ok: true, uploadId: uploadRow.id }
    if (job?.status === "error") throw new Error(job.error || "Worker error")
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error("Timed out waiting for worker.")
}

