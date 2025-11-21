"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { supabaseBrowser } from "@/lib/supabase"

export default function JobInspector() {
  const params = useParams()
  const uploadId = params.uploadId as string
  const [out, setOut] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!uploadId) return

    ;(async () => {
      try {
        const sb = supabaseBrowser()
        const [{ data: up, error: upErr }, { data: job, error: jobErr }, { data: deckCount }] =
          await Promise.all([
            sb.from("uploads").select("*").eq("id", uploadId).single(),
            sb.from("generation_jobs").select("*").eq("upload_id", uploadId).single(),
            sb.rpc("count_decks_for_upload", { upload_id: uploadId }).catch(() => ({
              data: null
            }))
          ])

        setOut({
          upload: up || { error: upErr },
          job: job || { error: jobErr },
          deckCount
        })
      } catch (e: any) {
        setOut({ error: String(e) })
      } finally {
        setLoading(false)
      }
    })()
  }, [uploadId])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Job Inspector</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Upload ID: <code className="bg-muted px-1 rounded">{uploadId}</code>
      </p>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <pre className="text-xs whitespace-pre-wrap bg-black/50 text-white p-4 rounded font-mono overflow-auto">
          {JSON.stringify(out, null, 2)}
        </pre>
      )}

      <p className="text-xs opacity-70 mt-4">
        Tip: check server console logs for <code>[dispatch]</code> / <code>[callback]</code> lines.
      </p>
    </div>
  )
}

