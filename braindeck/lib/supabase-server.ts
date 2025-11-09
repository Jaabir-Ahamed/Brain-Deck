// lib/supabase-server.ts
// This file should ONLY be imported in Server Components or Route Handlers
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export function supabaseServer() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookies().set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookies().set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    }
  )
}

