# Environment Variables Setup

Create a `.env.local` file in the `braindeck` directory with the following variables:

```env
# AI Provider Configuration
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
OLLAMA_MODEL_VL=qwen2.5vl:7b

# Supabase Configuration
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=__FILL__
NEXT_PUBLIC_SUPABASE_ANON_KEY=__FILL__
SUPABASE_SERVICE_ROLE_KEY=__FILL__
```

## Setup Instructions

1. **Install Ollama locally**: https://ollama.ai
2. **Pull required models**:
   ```bash
   ollama pull qwen2.5:7b-instruct
   # Optional for scanned PDFs:
   ollama pull qwen2.5vl:7b
   ```
3. **Start Ollama server**: The server should be running on `http://localhost:11434`
4. **Configure Supabase**: Fill in your Supabase credentials in `.env.local`

## Database Schema Requirements

The API expects the following Supabase tables:

- `uploads` - stores uploaded PDF metadata
- `suggestions` - stores generated flashcard suggestions
- `generation_jobs` - tracks generation job status

Make sure these tables exist with appropriate columns before using the API.

