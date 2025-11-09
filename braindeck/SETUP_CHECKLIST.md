# Setup Checklist

## ✅ Dependencies Installed

All required packages are already in `package.json`:
- ✓ `pdf-parse` v2.4.5
- ✓ `zod` v3.25.76  
- ✓ `@supabase/supabase-js` v2.80.0

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
OLLAMA_MODEL_VL=qwen2.5vl:7b
```

## 📦 Install Ollama Models

```bash
# Text model (default for regular PDFs)
ollama pull qwen2.5:7b-instruct

# Vision model (for scanned/image-heavy PDFs) 
ollama pull qwen2.5vl:7b
```

## 🗄️ Optional Database Migration

If you want difficulty as a column (not just in tags), run in Supabase SQL editor:

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

## ✨ What's New

### Files Created
- ✅ `lib/ai_schema.ts` - Zod schemas for validation
- ✅ `lib/progress.ts` - Progress tracking helpers  
- ✅ `app/api/generate/diagnose/route.ts` - Diagnostics endpoint
- ✅ `UPLOAD_GENERATION_GUIDE.md` - Complete documentation

### Files Updated
- ✅ `lib/ollama.ts` - Improved API client
- ✅ `app/api/generate/route.ts` - Full rewrite with difficulty & progress
- ✅ `app/uploads/page.tsx` - Added diagnostics button

### Features Added
1. **Difficulty Assignment**: Easy/Medium/Hard tags on all cards
2. **Progress Tracking**: Proper status updates (queued → processing → done)
3. **Diagnostics Endpoint**: Quick PDF parsing & AI validation test
4. **Better Error Handling**: Clear error messages for missing models
5. **Auto Deck Creation**: Named after PDF filename
6. **SRS Initialization**: Cards ready for spaced repetition
7. **Vision Model Support**: Automatically detects scanned PDFs
8. **Delete Uploads**: Full cleanup (storage + DB)

## 🧪 Testing

1. **Restart dev server** to load new env vars:
   ```bash
   pnpm dev
   ```

2. **Upload a PDF** on `/uploads` page

3. **Watch progress bar** update through stages

4. **If error occurs**, click diagnostics button (stethoscope icon)

5. **Check new deck** is created automatically

## 🔍 Diagnostics

Use the diagnostics button on failed uploads to see:
- Pages extracted
- Total characters
- Model used
- Sample AI output
- Validation errors

## 📊 Status Flow

```
Upload → Queued (10%) → Processing (50%) → Done (100%)
                                        ↓
                                      Error (0%)
```

## 🎯 Expected Behavior

1. **Upload PDF** → Creates upload + generation job
2. **Parsing starts** → Status: "processing", progress: 50%
3. **AI generates** → Creates cards with difficulty tags
4. **Deck created** → Named after PDF file
5. **Status: done** → Progress: 100%, navigate to deck
6. **If error** → Diagnostics button appears

## ⚠️ Common Issues

### Progress bar stuck at 50%
- ✅ **Fixed**: Now properly updates generation_jobs.status

### Model not found error
- Run: `ollama pull qwen2.5:7b-instruct`
- Check Ollama is running: `ollama list`

### No text extracted
- PDF might be scanned → Toggle "Use Vision Model"
- Click diagnostics to see extraction details

### Cards not appearing
- Check validation errors in diagnostics
- Verify AI output format
- Check server logs

## 🚀 Next Steps

See `UPLOAD_GENERATION_GUIDE.md` for:
- Detailed architecture
- API documentation  
- Troubleshooting guide
- Performance tips

