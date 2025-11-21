import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  return NextResponse.json({
    ok: true,
    hasKey: !!process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash"
  })
}

