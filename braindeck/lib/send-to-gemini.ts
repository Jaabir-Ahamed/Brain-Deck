"use client"

import { supabaseBrowser } from "@/lib/supabase"

export async function sendPdfToGemini(
  file: File,
  opts: { subjectId?: string | null; targetCount?: number } = {}
) {
  const sb = supabaseBrowser()

  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error("Please sign in first.")

  const path = `${user.id}/${crypto.randomUUID()}-${file.name}`
  const { error: upErr } = await sb.storage.from("uploads").upload(path, file, {
    contentType: "application/pdf",
    upsert: false
  })
  if (upErr) throw new Error(`Storage: ${upErr.message}`)

  const { data: uploadRow, error: rowErr } = await sb
    .from("uploads")
    .insert({
      user_id: user.id,
      subject_id: opts.subjectId ?? null,
      file_name: file.name,
      storage_path: path,
      status: "queued"
    })
    .select("*")
    .single()
  if (rowErr) throw new Error(`DB (uploads): ${rowErr.message}`)

  const { error: jobErr } = await sb
    .from("generation_jobs")
    .insert({ user_id: user.id, upload_id: uploadRow.id, status: "queued" })
  if (jobErr) throw new Error(`DB (generation_jobs): ${jobErr.message}`)

  // Call generate-gemini API (this is async, server will process in background)
  const r = await fetch("/api/generate-gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uploadId: uploadRow.id,
      subjectId: opts.subjectId ?? null,
      targetCount: opts.targetCount ?? 40
    })
  })
  if (!r.ok) {
    const errorText = await r.text()
    throw new Error(`generate-gemini failed: ${errorText}`)
  }
  
  // Return immediately - the API route will process in the background
  // The polling below will track the job status

  // Poll the job until done
  for (let i = 0; i < 120; i++) {
    const { data: job } = await sb
      .from("generation_jobs")
      .select("status,error")
      .eq("upload_id", uploadRow.id)
      .single()

    if (job?.status === "done") return { ok: true, uploadId: uploadRow.id }
    if (job?.status === "error") throw new Error(job.error || "Gemini error")
    await new Promise((res) => setTimeout(res, 2000))
  }
  throw new Error("Timed out waiting for Gemini.")
}

