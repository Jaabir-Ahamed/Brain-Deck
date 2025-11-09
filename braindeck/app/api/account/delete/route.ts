import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Delete user's data in order (respecting foreign key constraints)
    
    // 1. Delete SRS entries (references cards)
    const { data: cards } = await supabaseAdmin
      .from("cards")
      .select("id")
      .eq("user_id", userId)
    
    if (cards && cards.length > 0) {
      const cardIds = cards.map(c => c.id)
      await supabaseAdmin.from("srs").delete().in("card_id", cardIds)
    }

    // 2. Delete cards
    await supabaseAdmin.from("cards").delete().eq("user_id", userId)

    // 3. Delete suggestions
    await supabaseAdmin.from("suggestions").delete().eq("user_id", userId)

    // 4. Delete generation jobs
    await supabaseAdmin.from("generation_jobs").delete().eq("user_id", userId)

    // 5. Delete uploads and their files from storage
    const { data: uploads } = await supabaseAdmin
      .from("uploads")
      .select("storage_path")
      .eq("user_id", userId)

    if (uploads && uploads.length > 0) {
      const storagePaths = uploads.map(u => u.storage_path)
      await supabaseAdmin.storage.from("uploads").remove(storagePaths)
    }

    await supabaseAdmin.from("uploads").delete().eq("user_id", userId)

    // 6. Delete decks
    await supabaseAdmin.from("decks").delete().eq("user_id", userId)

    // 7. Delete subjects
    await supabaseAdmin.from("subjects").delete().eq("user_id", userId)

    // 8. Delete profile
    await supabaseAdmin.from("profiles").delete().eq("id", userId)

    // 9. Delete user from auth (this will cascade delete any auth-related data)
    const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (deleteAuthError) {
      console.error("Error deleting auth user:", deleteAuthError)
      // Continue anyway - profile and data are deleted
    }

    return NextResponse.json({ success: true, message: "Account deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    )
  }
}


