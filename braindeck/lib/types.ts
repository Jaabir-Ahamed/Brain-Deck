export type Subject = {
  id: string
  user_id: string
  name: string
  created_at: string
}

export type Deck = {
  id: string
  user_id: string
  subject_id: string | null
  name: string
  created_at: string
  updated_at: string
}

export type Card = {
  id: string
  user_id: string
  deck_id: string
  type: "qa" | "cloze"
  front: string
  back: string
  tags: string[]
  prov_source: "pdf" | "manual"
  prov_upload_id: string | null
  prov_page_refs: number[]
  created_at: string
}

export type SRS = {
  card_id: string
  ease: number
  interval_days: number
  due: string | null
  last_reviewed: string | null
}

export type Upload = {
  id: string
  user_id: string
  subject_id: string | null
  file_name: string
  storage_path: string
  size_mb: number | null
  page_count: number | null
  status: "queued" | "processing" | "done" | "error"
  created_at: string
}

export type Suggestion = {
  id: string
  user_id: string
  upload_id: string
  subject_id: string | null
  deck_id: string | null
  type: "qa" | "cloze"
  front: string
  back: string
  page_refs: number[]
  confidence: number | null
  status: "new" | "accepted" | "edited" | "discarded"
  model: string | null
  prompt_hash: string | null
  created_at: string
}

export type GenerationJob = {
  id: string
  upload_id: string
  user_id: string
  status: string
  priority: number
  worker_id: string | null
  error: string | null
  created_at: string
  started_at: string | null
  finished_at: string | null
}

export type ActivityItem = {
  id: string
  type: "card_accepted" | "upload_completed" | "deck_created"
  title: string
  description: string
  timestamp: string
}

