"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib/supabase"
import { sendPdfToWorker } from "@/lib/send-to-worker"

export default function DebugUpload() {
  const [file, setFile] = React.useState<File | null>(null)
  const [log, setLog] = React.useState<string>("")

  async function listMyFiles() {
    const sb = supabaseBrowser()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { 
      setLog("Not signed in.") 
      return 
    }
    const { data, error } = await sb.storage.from("uploads").list(user.id, { limit: 50 })
    if (error) {
      setLog(`List error: ${error.message}`)
    } else {
      setLog(`Files under uploads/${user.id}:\n${(data || []).map(o => o.name).join("\n") || "(none)"}`)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLog("Uploading PDF and dispatching to worker...")
    try {
      const res = await sendPdfToWorker(file, { targetCount: 30 })
      setLog(res.ok ? "Success! Deck created." : "Unexpected result.")
    } catch (e: any) {
      setLog(`Upload failed: ${e.message || String(e)}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Debug: Upload</h1>

      <div className="space-x-2">
        <button 
          onClick={listMyFiles} 
          className="rounded bg-neutral-800 text-white px-3 py-1 hover:bg-neutral-700"
        >
          List my files
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => setFile(e.currentTarget.files?.[0] || null)} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-neutral-800 file:text-white hover:file:bg-neutral-700"
        />
        <button 
          className="rounded bg-black text-white px-3 py-1 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={!file}
        >
          Send
        </button>
      </form>

      <pre className="text-xs whitespace-pre-wrap bg-neutral-950 text-neutral-200 p-3 rounded font-mono">
        {log || "Ready. Click 'List my files' or upload a PDF."}
      </pre>
    </div>
  )
}

