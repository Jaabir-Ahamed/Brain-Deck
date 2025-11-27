import type { SupabaseClient } from "@supabase/supabase-js"

export async function setJobStatus(
  supabase: SupabaseClient,
  uploadId: string,
  status: string,
  msg?: string
) {
  const updates: Record<string, any> = {
    status,
    error: msg ?? null,
  }

  if (status === "processing") {
    updates.started_at = new Date().toISOString()
  }

  if (["done", "error"].includes(status)) {
    updates.finished_at = new Date().toISOString()
  }

  await supabase
    .from("generation_jobs")
    .update(updates)
    .eq("upload_id", uploadId)

  // Also update uploads table status
  await supabase
    .from("uploads")
    .update({ status: status === "done" ? "done" : status === "error" ? "error" : "processing" })
    .eq("id", uploadId)
}

