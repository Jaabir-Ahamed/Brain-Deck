// Import pdf-parse - server-only, use require for CommonJS
// pdf-parse v2.4.5 exports PDFParse class, we need to instantiate it
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
      // Find the class - it might be default export or named export
      if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === "function") {
        PDFParseClass = pdfParseModule.PDFParse
      } else if (typeof pdfParseModule.default === "function") {
        PDFParseClass = pdfParseModule.default
      } else if (typeof pdfParseModule === "function") {
        PDFParseClass = pdfParseModule
      } else {
        const moduleType = typeof pdfParseModule
        const moduleKeys = Object.keys(pdfParseModule || {}).slice(0, 10).join(", ")
        throw new Error(`PDFParse class not found. Module type: ${moduleType}, keys: ${moduleKeys}`)
      }
    } catch (error: any) {
      console.error("Error loading pdf-parse:", error)
      throw new Error(`Failed to load pdf-parse: ${error.message}`)
    }
  }
  return PDFParseClass
}

// Page renderer function for pdf-parse
// This will be called for each page during text extraction
async function renderPageText(pageData: any) {
  const render_options = { normalizeWhitespace: true, disableCombineTextItems: false }
  try {
    const textContent = await pageData.getTextContent(render_options)
    const strings = textContent.items.map((it: any) => it.str)
    const pageText = strings.join(" ").replace(/\s+/g, " ").trim()
    return pageText
  } catch (error) {
    console.error("Error rendering page text:", error)
    return ""
  }
}

export async function extractPagesFromBuffer(buf: Buffer) {
  const PDFParse = await getPdfParseClass()
  
  // Create instance of PDFParse class with 'new'
  const parser = new PDFParse({ data: buf })
  
  // Get text with page-by-page extraction
  const result = await parser.getText({ 
    pagerender: renderPageText 
  })
  
  // Extract pages from result
  // pdf-parse returns pages array in result.pages
  const pages: string[] = []
  
  if (result.pages && Array.isArray(result.pages)) {
    // Extract text from each page object
    result.pages.forEach((page: any) => {
      if (typeof page === "string") {
        pages.push(page)
      } else if (page.text) {
        pages.push(page.text)
      } else if (page.num !== undefined) {
        // Page object with num property
        pages.push(page.text || "")
      }
    })
  } else if (result.text) {
    // Fallback: if no pages array, split text by page markers
    // pdf-parse might include page separators
    const pageTexts = result.text.split(/\n-- page_number of total_number --\n/)
    if (pageTexts.length > 1) {
      pages.push(...pageTexts)
    } else {
      // Single page or no page markers - try to split by double newlines
      const splitPages = result.text.split(/\n\n+/)
      if (splitPages.length > 1) {
        pages.push(...splitPages)
      } else {
        pages.push(result.text)
      }
    }
  }
  
  return { pages: pages.filter(p => p.trim().length > 0) }
}

export function chunkPages(
  pages: string[],
  opts: { maxChars?: number; windowPages?: number } = {}
) {
  const maxChars = opts.maxChars ?? 4000
  const windowPages = opts.windowPages ?? 2
  const chunks: { text: string; pageStart: number; pageEnd: number }[] = []
  for (let i = 0; i < pages.length; i += windowPages) {
    const group = pages.slice(i, i + windowPages)
    let text = group.join("\n\n")
    if (text.length > maxChars) text = text.slice(0, maxChars)
    chunks.push({ text, pageStart: i + 1, pageEnd: Math.min(i + windowPages, pages.length) })
  }
  return chunks
}

// Optional: render PDF pages to base64 PNGs for VL models (scanned PDFs).
// Leave as stub to keep build simple; implement later with pdfjs-dist or poppler.
export async function renderPdfToBase64Pngs(_buf: Buffer, _maxPages = 4): Promise<string[]> {
  // TODO: implement image rendering if you truly need VL; for now return empty -> text path only.
  return []
}
