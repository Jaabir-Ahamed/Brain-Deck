# Upload & Generation Guide

## Overview

This guide explains the PDF upload and flashcard generation system using Ollama AI models.

## Environment Variables

Add these to your `.env.local`:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
OLLAMA_MODEL_VL=qwen2.5vl:7b
```

## Required Models

Install the required Ollama models:

```bash
# Text model (default for regular PDFs)
ollama pull qwen2.5:7b-instruct

# Vision model (for scanned/image-heavy PDFs)
ollama pull qwen2.5vl:7b
```

## How It Works

### 1. PDF Upload
- User uploads a PDF (max 20MB)
- System creates upload record and generation job
- Status: `queued`

### 2. Text Extraction
- PDF is parsed using `pdf-parse` library
- Text is extracted page by page
- System detects if PDF is scanned (< 400 chars per page on average)
- If scanned, automatically switches to vision model

### 3. AI Generation
- Text is chunked into manageable pieces (4000 chars, 2 pages per chunk)
- Each chunk is sent to Ollama with a specialized prompt
- AI generates flashcards with:
  - Type: `qa` (question-answer) or `cloze` (fill-in-blank)
  - Front: Question or prompt
  - Back: Answer
  - Difficulty: `easy`, `medium`, or `hard`
  - Page references: Original page numbers
  - Confidence: 0-1 score

### 4. Validation
- AI output is validated against Zod schema
- Invalid suggestions are skipped
- Valid cards are created with difficulty tags

### 5. Deck Creation
- A new deck is automatically created (named after PDF filename)
- Cards are inserted into the deck
- SRS (Spaced Repetition System) entries are initialized

### 6. Status Updates
- Status updates throughout: `queued` → `processing` → `done`/`error`
- UI reflects real-time progress
- Generation jobs table tracks progress

## API Endpoints

### POST `/api/generate`
Main generation endpoint that creates deck and cards.

**Request:**
```json
{
  "uploadId": "string",
  "subjectId": "string (optional)",
  "targetCount": 50,
  "preferVL": false
}
```

**Response:**
```json
{
  "created": 42,
  "deckId": "deck-123",
  "deckName": "Biology Chapter 3",
  "model": "qwen2.5:7b-instruct"
}
```

### POST `/api/generate/diagnose`
Quick diagnostics endpoint for testing PDF parsing and AI output.

**Request:**
```json
{
  "uploadId": "string",
  "preferVL": false
}
```

**Response:**
```json
{
  "ok": true,
  "looksScanned": false,
  "pages": 28,
  "totalChars": 45000,
  "model": "qwen2.5:7b-instruct",
  "sample": {
    "suggestions": [...]
  }
}
```

## Difficulty Levels

Cards are tagged with difficulty levels:
- `easy`: Basic facts, definitions
- `medium`: Concepts, relationships
- `hard`: Complex analysis, multi-step reasoning

Difficulty is stored in `cards.tags` as `difficulty:easy`, `difficulty:medium`, or `difficulty:hard`.

## Optional Database Migration

If you prefer storing difficulty as a separate column instead of in tags:

```sql
ALTER TABLE public.suggestions 
  ADD COLUMN IF NOT EXISTS difficulty TEXT 
  CHECK (difficulty IN ('easy','medium','hard')) 
  DEFAULT 'medium';

ALTER TABLE public.cards 
  ADD COLUMN IF NOT EXISTS difficulty TEXT 
  CHECK (difficulty IN ('easy','medium','hard')) 
  DEFAULT 'medium';
```

Then update the card insert in `/app/api/generate/route.ts` to include:
```typescript
difficulty: s.difficulty,
```

## Troubleshooting

### PDF Parsing Issues
- Use the diagnostics button (stethoscope icon) on failed uploads
- Check if PDF is scanned → enable "Use Vision Model" toggle
- Ensure PDF has extractable text (not just images)

### Model Not Found
- Verify Ollama is running: `ollama list`
- Pull missing models: `ollama pull qwen2.5:7b-instruct`
- Check `OLLAMA_BASE_URL` in `.env.local`

### Stuck Progress Bar
- Check `generation_jobs` table status
- Verify Ollama server is responding
- Check server logs for errors

### No Cards Generated
- PDF might have no extractable text
- AI output might be invalid JSON
- Use diagnostics endpoint to debug
- Check validation errors in server logs

## UI Features

### Uploads Page
- **Upload progress**: Shows real-time status
- **Delete button**: Remove upload and associated files
- **Diagnostics button**: Appears on error status for debugging
- **Vision model toggle**: Use for scanned PDFs

### Status Indicators
- ✓ **Complete** (green): Generation successful
- ⚠ **Error** (red): Generation failed
- 📄 **Processing** (blue): Currently generating
- ⏳ **Queued** (gray): Waiting to start

## Architecture

### Files Created
- `lib/ai_schema.ts` - Zod schemas for AI validation
- `lib/progress.ts` - Progress tracking helpers
- `app/api/generate/route.ts` - Main generation endpoint
- `app/api/generate/diagnose/route.ts` - Diagnostics endpoint

### Files Updated
- `lib/ollama.ts` - Ollama API client
- `lib/pdf.ts` - PDF parsing utilities
- `app/uploads/page.tsx` - Upload UI with diagnostics

### Data Flow
```
User uploads PDF
    ↓
Create upload record & generation job
    ↓
Download PDF from Supabase storage
    ↓
Extract text with pdf-parse
    ↓
Chunk text into manageable pieces
    ↓
Send chunks to Ollama AI
    ↓
Validate AI output with Zod
    ↓
Create deck & insert cards
    ↓
Initialize SRS entries
    ↓
Mark status as done
    ↓
Navigate to new deck
```

## Performance Tips

1. **Adjust target count**: Lower `targetCount` for faster generation
2. **Use text model**: Vision model is slower but handles scanned PDFs
3. **Chunk size**: Adjust `maxChars` in `chunkPages()` for balance
4. **Batch processing**: Generate in background, don't block UI

## Future Enhancements

- [ ] Add suggestions review flow before card creation
- [ ] Support for custom prompts
- [ ] Batch upload multiple PDFs
- [ ] Export cards to Anki format
- [ ] Analytics on difficulty distribution

