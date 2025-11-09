type ChatMessage = { role: "system" | "user"; content: string; images?: string[] }

export async function askOllamaJSON(
  messages: ChatMessage[],
  opts: {
    model?: string
    temperature?: number
    numCtx?: number
    baseUrl?: string
    forceJson?: boolean
  } = {}
): Promise<any> {
  const model = opts.model ?? process.env.OLLAMA_MODEL ?? "qwen2.5:7b-instruct"
  const temperature = opts.temperature ?? 0.2
  const num_ctx = opts.numCtx ?? 8192
  const base = (opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? "http://localhost:11434").replace(/\/$/, "")

  // If any message includes images, don't set format=json (qwen-vl supports multimodal natively)
  const hasImages = messages.some((m) => Array.isArray(m.images) && m.images.length > 0)
  const payload: any = {
    model,
    messages,
    stream: false,
    options: { temperature, num_ctx },
  }

  // Only use format=json if no images and forceJson is not explicitly false
  if ((opts.forceJson !== false && !hasImages) || opts.forceJson) {
    payload.format = "json"
  }

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorText = await res.text()
    let errorMessage = `Ollama ${res.status}: ${errorText}`
    // Provide helpful error message for missing model
    if (res.status === 404 && errorText.includes("not found")) {
      errorMessage = `Model '${model}' not found. Please install it with: ollama pull ${model}`
    }
    throw new Error(errorMessage)
  }

  const data = await res.json()
  const text = data?.message?.content ?? "{}"

  try {
    return typeof text === "string" ? JSON.parse(text) : text
  } catch {
    return null
  }
}

