"use client"

import * as React from "react"
import { supabaseBrowser } from "@/lib/supabase"

export default function SignInPage() {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setError(null)

    try {
      const supabase = supabaseBrowser()
      const redirectTo = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })

      if (error) throw error
      setStatus("sent")
    } catch (err: any) {
      setError(err?.message ?? "Failed to send magic link")
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-neutral-600">We'll email you a one-time sign-in link.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              className="mt-2 w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="inline-flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {status === "sent" && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            Check your inbox for the sign-in link. (Also check spam.)
          </div>
        )}

        {status === "error" && error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>
        )}

        <p className="mt-6 text-xs text-neutral-500">By continuing you agree to our Terms & Privacy.</p>
      </div>
    </div>
  )
}

