import { z } from "zod"

export const SuggestionSchema = z.object({
  type: z.enum(["qa", "cloze"]).default("qa"),
  front: z.string().min(1),
  back: z.string().min(1),
  pageRefs: z.array(z.number().int().positive()).min(1),
  confidence: z.number().min(0).max(1).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
})

export const SuggestionsPayloadSchema = z.object({
  suggestions: z.array(SuggestionSchema).min(1),
})

export type Suggestion = z.infer<typeof SuggestionSchema>

