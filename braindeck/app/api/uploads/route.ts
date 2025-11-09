import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

// GET /api/uploads?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/uploads
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { user_id, subject_id, file_name, storage_path, size_mb, page_count } = body

    if (!user_id || !file_name || !storage_path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("uploads")
      .insert({
        user_id,
        subject_id: subject_id || null,
        file_name,
        storage_path,
        size_mb: size_mb || null,
        page_count: page_count || null,
        status: "queued",
      })
      .select()
      .single()

    if (error) throw error

    // Create generation job
    await supabaseAdmin.from("generation_jobs").insert({
      upload_id: data.id,
      user_id,
      status: "queued",
      priority: 0,
    })

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/uploads?id=...
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const body = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from("uploads").update(body).eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/uploads?id=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    // Get upload record to access storage_path
    const { data: upload, error: fetchError } = await supabaseAdmin
      .from("uploads")
      .select("storage_path, user_id")
      .eq("id", id)
      .single()

    if (fetchError || !upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Delete file from storage
    if (upload.storage_path) {
      await supabaseAdmin.storage.from("uploads").remove([upload.storage_path])
    }

    // Delete related generation jobs
    await supabaseAdmin.from("generation_jobs").delete().eq("upload_id", id)

    // Delete related suggestions (optional - you might want to keep them)
    // Uncomment if you want to delete suggestions too:
    // await supabaseAdmin.from("suggestions").delete().eq("upload_id", id)

    // Delete upload record
    const { error: deleteError } = await supabaseAdmin.from("uploads").delete().eq("id", id)

    if (deleteError) throw deleteError
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

