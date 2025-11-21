// lib/pdf.ts
// Works on Next.js (Node runtime). Do not import on the client.

let pdfParseFn: any

/** Load pdf-parse whether it's exported as default (ESM shim) or CommonJS. */
async function getPdfParse() {
  if (pdfParseFn) return pdfParseFn

  // Try ESM default first
  try {
    const mod: any = await import("pdf-parse")
    const fn = mod?.default ?? mod
    if (typeof fn === "function") {
      pdfParseFn = fn
      return pdfParseFn
    }
  } catch (_) {}

  // Fallback: load CommonJS via createRequire
  const { createRequire } = await import("node:module")
  const require = createRequire(import.meta.url)
  const fn = require("pdf-parse")
  if (typeof fn !== "function") {
    throw new Error("Could not load pdf-parse function")
  }
  pdfParseFn = fn
  return pdfParseFn
}

export async function extractPagesFromBuffer(buf: Buffer) {
  const pdfParse = await getPdfParse()
  const parsed = await pdfParse(buf, { pagerender: renderPageText })
  const pages = (parsed as any).__pages ?? []
  return { pages }
}

function renderPageText(pageData: any) {
  const opts = { normalizeWhitespace: true, disableCombineTextItems: false }
  return pageData.getTextContent(opts).then((tc: any) => {
    const pageText = tc.items.map((it: any) => it.str).join(" ").replace(/\s+/g, " ").trim()
    if (!pageData._reader.__pages) pageData._reader.__pages = []
    pageData._reader.__pages.push(pageText)
    return pageText
  })
}

export function chunkPages(pages: string[], maxChars = 4000, windowPages = 2) {
  const chunks: { text: string; pageStart: number; pageEnd: number }[] = []
  for (let i = 0; i < pages.length; i += windowPages) {
    const group = pages.slice(i, i + windowPages)
    let text = group.join("\n\n")
    if (text.length > maxChars) text = text.slice(0, maxChars)
    chunks.push({ text, pageStart: i + 1, pageEnd: Math.min(i + windowPages, pages.length) })
  }
  return chunks
}
