import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// POST /api/upload-file
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string
    const subjectId = formData.get("subjectId") as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 })
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > 20) {
      return NextResponse.json({ error: "File size must be less than 20MB" }, { status: 400 })
    }

    // Check quota
    const { data: quota } = await supabaseAdmin.rpc("can_upload", { p_size_mb: sizeMB })
    if (!quota) {
      return NextResponse.json({ error: "Upload quota exceeded" }, { status: 403 })
    }

    // Generate storage path
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${file.name}`
    const storagePath = `${userId}/${fileName}`

    // Upload to Supabase storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const { error: uploadError } = await supabaseAdmin.storage
      .from("uploads")
      .upload(storagePath, fileBuffer, {
        contentType: "application/pdf",
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Create upload record
    const { data: upload, error: dbError } = await supabaseAdmin
      .from("uploads")
      .insert({
        user_id: userId,
        subject_id: subjectId || null,
        file_name: file.name,
        storage_path: storagePath,
        size_mb: Number.parseFloat(sizeMB.toFixed(2)),
        status: "queued",
      })
      .select()
      .single()

    if (dbError) {
      // Clean up storage if DB insert fails
      await supabaseAdmin.storage.from("uploads").remove([storagePath])
      throw dbError
    }

    // Create generation job
    await supabaseAdmin.from("generation_jobs").insert({
      upload_id: upload.id,
      user_id: userId,
      status: "queued",
      priority: 0,
    })

    return NextResponse.json(upload, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

