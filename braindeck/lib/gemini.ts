import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY!
if (!apiKey) console.error("[gemini] Missing GEMINI_API_KEY")

const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash"

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: modelName })

export async function askGeminiJSON(system: string, user: string) {
  const res = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
  })

  const txt = res.response.text() || "{}"
  return JSON.parse(txt)
}

