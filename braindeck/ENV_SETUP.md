# Environment Variables Setup

Create a `.env.local` file in the `braindeck` directory with the following variables:

```env
# Supabase Configuration
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=__FILL__
NEXT_PUBLIC_SUPABASE_ANON_KEY=__FILL__
SUPABASE_SERVICE_ROLE_KEY=__FILL__    # server-only

# Where this app is reachable by the worker (LAN/Tailscale/public)
# Optional: If not set, will be derived from the request URL
# Set this explicitly if your worker is on a different network
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Remote worker info
REMOTE_WORKER_URL=http://<WORKER_PC_IP_OR_HOST>:8080
REMOTE_WORKER_TOKEN=<same-as-WORKER_TOKEN-on-worker>

# Secret used to verify callbacks FROM worker → your app
CALLBACK_SECRET=<long-random-string>

# Gemini AI Configuration (for flashcard generation)
GEMINI_API_KEY=__PASTE_YOUR_KEY__
GEMINI_MODEL=gemini-1.5-flash   # good default; you can try gemini-1.5-pro later

# Optional vision settings (for scanned/image PDFs)
VISION_MAX_PAGES=8              # how many pages to rasterize when in vision path
VISION_DPI=150                  # rasterization DPI
```

## Setup Instructions

1. **Configure Supabase**: Fill in your Supabase credentials in `.env.local`
2. **Set up Gemini AI** (recommended for flashcard generation):
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Set `GEMINI_API_KEY` to your API key
   - (Optional) Set `GEMINI_MODEL` to `gemini-1.5-flash` (default) or `gemini-1.5-pro` for better quality
   - (Optional) For scanned/image PDFs, install Poppler:
     - macOS: `brew install poppler`
     - Ubuntu/Debian: `sudo apt-get install poppler-utils`
     - Windows: Download from [Poppler for Windows](https://github.com/oschwartz10612/poppler-windows/releases) and add to PATH
3. **Set up remote worker** (optional, for vision model support):
   - Set `REMOTE_WORKER_URL` to your worker's IP/hostname and port (e.g., `http://192.168.1.100:8080`)
   - Set `REMOTE_WORKER_TOKEN` to match the `WORKER_TOKEN` on your worker machine
   - (Optional) Set `NEXT_PUBLIC_BASE_URL` to where your app is reachable from the worker (use LAN IP, Tailscale, or public URL). If not set, it will be derived from the request URL (may not work if worker is on a different network)
   - Generate a random string for `CALLBACK_SECRET` (used to verify callbacks from worker)

## Database Schema Requirements

The API expects the following Supabase tables:

- `uploads` - stores uploaded PDF metadata
- `suggestions` - stores generated flashcard suggestions
- `generation_jobs` - tracks generation job status

Make sure these tables exist with appropriate columns before using the API.

