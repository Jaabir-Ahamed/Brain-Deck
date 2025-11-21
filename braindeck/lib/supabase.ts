// lib/supabase.ts
// This file should ONLY be imported in Client Components
import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Validate URL format
const isValidUrl = (url: string): boolean => {
  if (!url || url === "__FILL__") return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function supabaseBrowser() {
  if (!isValidUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey === "__FILL__") {
    throw new Error(
      "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

