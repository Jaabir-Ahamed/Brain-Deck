import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in", url.origin))
  }

  const supabase = supabaseServer()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  // Redirect destination after login
  const next = url.searchParams.get("next") || "/"
  const dest = error ? "/auth/sign-in?error=callback" : next

  return NextResponse.redirect(new URL(dest, url.origin))
}

