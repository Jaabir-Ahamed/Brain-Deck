import { execa } from "execa"
import tmp from "tmp"
import { promises as fs } from "fs"
import path from "node:path"

// Import pdf-parse - server-only, use require for CommonJS
let PDFParseClass: any = null

async function getPdfParseClass() {
  if (!PDFParseClass) {
    try {
      // Ensure we're in server context
      if (typeof window !== "undefined") {
        throw new Error("pdf-parse can only be used in server-side code")
      }

      // Use require for CommonJS compatibility
      const { createRequire } = await import("module")
      const require = createRequire(import.meta.url)
      const pdfParseModule = require("pdf-parse")

      // pdf-parse v2.4.5 exports PDFParse class
      if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === "function") {
        PDFParseClass = pdfParseModule.PDFParse
      } else if (typeof pdfParseModule.default === "function") {
        PDFParseClass = pdfParseModule.default
      } else if (typeof pdfParseModule === "function") {
        PDFParseClass = pdfParseModule
      } else {
        throw new Error(`PDFParse class not found in pdf-parse module`)
      }
    } catch (error: any) {
      console.error("Error loading pdf-parse:", error)
      throw new Error(`Failed to load pdf-parse: ${error.message}`)
    }
  }
  return PDFParseClass
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

export async function extractPagesFromBuffer(buf: Buffer) {
  const PDFParse = await getPdfParseClass()
  const parsed = await new PDFParse(buf, { pagerender: renderPageText })
  const pages = (parsed as any).__pages as string[] | undefined
  return { pages: pages ?? [] }
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

/**
 * Rasterize PDF to PNG using poppler's pdftoppm (must be installed and on PATH).
 * Returns array of { page: number, mime: 'image/png', b64: string }
 */
export async function rasterizePdfToPngs(
  pdfBuf: Buffer,
  opts?: { maxPages?: number; dpi?: number }
) {
  const maxPages = Number(process.env.VISION_MAX_PAGES || opts?.maxPages || 8)
  const dpi = Number(process.env.VISION_DPI || opts?.dpi || 150)

  // write temp pdf
  const tmpPdf = tmp.fileSync({ postfix: ".pdf" })
  await fs.writeFile(tmpPdf.name, pdfBuf)

  // pdftoppm -png -r <dpi> -f 1 -l <maxPages> input.pdf outprefix
  const outDir = tmp.dirSync({ unsafeCleanup: true })
  const outPrefix = path.join(outDir.name, "page")
  try {
    await execa(
      "pdftoppm",
      ["-png", "-r", String(dpi), "-f", "1", "-l", String(maxPages), tmpPdf.name, outPrefix],
      { stdout: "ignore", stderr: "pipe" }
    )
  } catch (e: any) {
    throw new Error(
      "pdftoppm not found or failed. Install Poppler (macOS: brew install poppler; Ubuntu: sudo apt-get install poppler-utils; Windows: install Poppler for Windows and add to PATH)."
    )
  }

  // collect files page-1.png, page-2.png, ...
  const files = await fs.readdir(outDir.name)
  const pngs = files
    .filter((f) => f.endsWith(".png"))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => path.join(outDir.name, name))

  const out: { page: number; mime: string; b64: string }[] = []
  for (const p of pngs) {
    const b = await fs.readFile(p)
    const pageNum = Number(p.match(/page-(\d+)\.png$/)?.[1] ?? out.length + 1)
    out.push({ page: pageNum, mime: "image/png", b64: b.toString("base64") })
  }

  // cleanup async
  setTimeout(() => {
    try {
      tmpPdf.removeCallback()
      outDir.removeCallback()
    } catch {}
  }, 0)
  return out
}

