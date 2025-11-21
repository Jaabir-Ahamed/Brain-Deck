import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

function requireEnv(key: string) {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env ${key}`)
  return v
}

export async function POST(req: NextRequest) {
  try {
    const { uploadId, subjectId, targetCount = 50, preferVL = false } = await req.json()
    console.log("[dispatch] uploadId:", uploadId, "subjectId:", subjectId, "target:", targetCount, "vision:", preferVL)

    // env checks
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl || baseUrl === "__FILL__") {
      const url = new URL(req.url)
      baseUrl = `${url.protocol}//${url.host}`
    }
    const workerUrl = requireEnv("REMOTE_WORKER_URL")
    const workerToken = requireEnv("REMOTE_WORKER_TOKEN")
    const callbackSecret = requireEnv("CALLBACK_SECRET")

    // 1) Load upload
    const { data: upload, error: upErr } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single()
    if (upErr || !upload) {
      console.error("[dispatch] upload not found", upErr)
      return NextResponse.json({ error: "upload not found" }, { status: 404 })
    }
    console.log("[dispatch] storage_path:", upload.storage_path, "user_id:", upload.user_id)

    // 2) Signed URL
    const { data: signed, error: signErr } = await supabaseAdmin
      .storage.from("uploads")
      .createSignedUrl(upload.storage_path, 60 * 30)
    if (signErr || !signed?.signedUrl) {
      console.error("[dispatch] sign failed", signErr)
      return NextResponse.json({ error: "sign failed" }, { status: 500 })
    }

    // 3) Mark job processing
    await supabaseAdmin.from("generation_jobs")
      .update({ status: "processing", started_at: new Date().toISOString() })
      .eq("upload_id", uploadId)

    // 4) Send job to worker
    const payload = {
      jobId: uploadId,
      upload: { signedUrl: signed.signedUrl, fileName: upload.file_name },
      subjectId,
      targetCount,
      preferVL,
      callbackUrl: `${baseUrl}/api/remote/callback`,
      callbackSecret,
    }

    console.log("[dispatch] POST", `${workerUrl}/v1/jobs`)
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    let r: Response
    try {
      r = await fetch(`${workerUrl}/v1/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${workerToken}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      const errorMessage = fetchError.message || String(fetchError)
      const isTimeout = fetchError.name === "AbortError" || errorMessage.includes("timeout")
      const errorMsg = isTimeout
        ? `Connection timeout: Worker did not respond within 30 seconds. Check REMOTE_WORKER_URL (${workerUrl}) and ensure the worker is running and reachable.`
        : `Worker connection failed: ${errorMessage}. Check REMOTE_WORKER_URL (${workerUrl}) and ensure the worker is running.`
      
      console.error("[dispatch] fetch error", errorMsg)
      await supabaseAdmin.from("generation_jobs")
        .update({ status: "error", error: errorMsg, finished_at: new Date().toISOString() })
        .eq("upload_id", uploadId)
      
      return NextResponse.json({ error: `Cannot reach worker at ${workerUrl}. ${errorMessage}` }, { status: 502 })
    }

    const body = await r.text().catch(() => "")
    console.log("[dispatch] worker status", r.status, "body:", body)

    if (!r.ok) {
      await supabaseAdmin.from("generation_jobs")
        .update({ status: "error", error: `Worker ${r.status} ${body}`, finished_at: new Date().toISOString() })
        .eq("upload_id", uploadId)
      return NextResponse.json({ error: "worker error" }, { status: 502 })
    }

    return NextResponse.json({ ok: true }, { status: 202 })
  } catch (e: any) {
    console.error("[dispatch] exception", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

