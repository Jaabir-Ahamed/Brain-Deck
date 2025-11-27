# Supabase Integration Summary

## Database Schema

The application uses the following Supabase tables (as defined in the SQL schema):

- **profiles** - User profiles (1:1 with auth.users)
- **subjects** - Subject categories for organizing decks
- **decks** - Flashcard decks
- **cards** - Individual flashcards
- **srs** - Spaced Repetition System data
- **uploads** - PDF uploads
- **suggestions** - AI-generated flashcard suggestions
- **generation_jobs** - Job queue for AI generation
- **flags** - Flagged cards
- **review_events** - Review history

## API Routes Created

### `/api/subjects`
- GET - List all subjects
- POST - Create subject
- DELETE - Delete subject

### `/api/decks`
- GET - List decks (with optional filters)
- POST - Create deck
- DELETE - Delete deck

### `/api/cards`
- GET - List cards for a deck
- POST - Create card (also initializes SRS entry)
- PATCH - Update card
- DELETE - Delete card

### `/api/suggestions`
- GET - List suggestions (with optional filters)
- PATCH - Update suggestion
- POST `/api/suggestions/accept` - Accept suggestion and create card

### `/api/uploads`
- GET - List uploads for a user
- POST - Create upload record
- PATCH - Update upload status

### `/api/upload-file`
- POST - Upload PDF file to Supabase storage and create upload record

### `/api/generate`
- POST - Generate flashcard suggestions from uploaded PDF using Ollama

## Authentication

- Sign in: `/auth/signin` - Uses Supabase Auth
- Sign up: `/auth/signup` - Creates user and profile
- Reset password: `/auth/reset-password` - Sends password reset email

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
OLLAMA_MODEL_VL=qwen2.5vl:7b
```

## Next Steps

1. **Update components** to fetch data from API routes instead of mock store
2. **Add authentication checks** to protected routes
3. **Create auth context/provider** for managing user state
4. **Update store** to use API calls instead of local state
5. **Add error handling** and loading states throughout the app

## Key Changes Made

1. ✅ Created Supabase client (`lib/supabase.ts`)
2. ✅ Updated types to match database schema
3. ✅ Created API routes for CRUD operations
4. ✅ Updated auth pages to use Supabase Auth
5. ✅ Updated uploads page to use Supabase storage
6. ✅ Updated generate API to match schema

## Remaining Work

- Update all components to use API routes
- Add authentication middleware
- Update store to fetch from API
- Add proper error handling
- Add loading states
- Update profile page to fetch from database

