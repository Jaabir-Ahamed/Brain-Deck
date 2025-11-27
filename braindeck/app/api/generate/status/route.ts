import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// GET /api/generate/status?uploadId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uploadId = searchParams.get("uploadId")

    if (!uploadId) {
      return NextResponse.json({ error: "Missing uploadId" }, { status: 400 })
    }

    // Get upload
    const { data: upload, error: uploadError } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("id", uploadId)
      .single()

    if (uploadError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Get generation job
    const { data: job, error: jobError } = await supabaseAdmin
      .from("generation_jobs")
      .select("*")
      .eq("upload_id", uploadId)
      .single()

    // Get cards created so far
    const { data: cards, count: cardCount } = await supabaseAdmin
      .from("cards")
      .select("*", { count: "exact" })
      .eq("prov_upload_id", uploadId)

    const response: any = {
      upload: {
        id: upload.id,
        fileName: upload.file_name,
        status: upload.status,
        pageCount: upload.page_count,
        createdAt: upload.created_at,
      },
      job: job
        ? {
            status: job.status,
            startedAt: job.started_at,
            finishedAt: job.finished_at,
            error: job.error,
          }
        : null,
      cardsCreated: cardCount || 0,
    }

    // Calculate duration if processing
    if (job?.started_at && job.status === "processing") {
      const duration = Math.round((new Date().getTime() - new Date(job.started_at).getTime()) / 1000)
      response.durationSeconds = duration
      response.durationMinutes = Math.round(duration / 60 * 10) / 10
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error("Error checking status:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

